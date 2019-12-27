const request = require('request').defaults({jar: true});
const rp = require('request-promise-native').defaults({jar: true});
const fs = require('fs');
const models = require('./models');

const GET_SESSION_URL = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_TFP_PG.ISCRIPT2.FieldFormula.IScript_AutoLogOut';
const SEARCH_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3';
const DETAILS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getResultsDetails';
const COURSE_SUBJECTS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSubjects';
const TERMS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getCareers';

const term_parser = /(spring|summer|fall|spring|annual term) (\d{4})/i;

const COURSES_DATA_DIR = 'courses_data';
const get_courses_path = term => `${COURSES_DATA_DIR}/courses_${term}.json`;
const get_subjects_path = term => `${COURSES_DATA_DIR}/subjects_${term}.json`;
const TERMS_PATH = `${COURSES_DATA_DIR}/terms.json`;

if (!fs.existsSync(COURSES_DATA_DIR)) {
    fs.mkdirSync(COURSES_DATA_DIR);
}

const time = Date.now;
const startTimes = {};
function tic(name) {
    return startTimes[name] = time();
}
function toc(name) {
    const dt = time() - startTimes[name];
    console.log(`${name === undefined ? "" : name + " "}time: ${dt}`);
    return dt;
}

function get_term_number(term) {
    term = term.toLowerCase();
    const thing = term_parser.exec(term);
    const period = thing[1];
    const year = thing[2];
    return year[0] + year.substring(2) + {
        'spring': '2',
        'annual term': '4',
        'summer': '5',
        'fall': '8'
    }[period];
}

function get_search_url(term, career='ALL') {
    return `${SEARCH_URL}?term=${get_term_number(term)}&career=${career}`;
}

function get_details_url(term, class_num) {
    return `${DETAILS_URL}?term=${get_term_number(term)}&class_num=${class_num}`;
}

function get_course_subjects_url(term, career='ALL') {
    return `${COURSE_SUBJECTS_URL}?term=${get_term_number(term)}&career=${career}`;
}

function save_data(term, courses, long_subject_dict) {
    models.reset(term);
    const subject_finder = /^[A-Z]+/;
    for (const course_data of courses) {
        const subject = subject_finder.exec(course_data.course_num)[0];
        const subject_long = long_subject_dict[subject];
        const course = new models.Course(course_data.course_num, subject,
            subject_long, course_data.course_title, course_data.desc_long, term);
        for (const section of course_data.sections) {
            const comp_desc = section.comp_desc;
            for (const component_data of section.components) {
                const component_short = component_data.ssr_comp;
                const section = new models.Section(component_data.class_num,
                    component_data.section_num, component_data.assoc_class,
                    comp_desc, component_short, component_data.status, term);
                for (const location of component_data.locations) {
                    for (const meeting of location.meetings) {
                        for (const day of meeting.days) {
                            section.add_period(day,
                                meeting.meet_start_min,
                                meeting.meet_end_min);
                        }
                    }
                }
                course.add_section(section);
                models.sections[term].push(section);
            }
        }
        models.courses[term].push(course);
    }
}

function all(functions, resolve, reject) {
    /* `functions` is an array; each element is a function of the functions (resolve, reject) */
    var n = functions.length;
    var nDone = 0;
    var vals = [];
    var done = false;
    for (let i = 0; i < functions.length; i++) {
        const f = functions[i];
        f(function(thing) {
            vals[i] = thing;
            if (++nDone === n) {
                resolve(vals);
            }
        }, function(err) {
            if (!done) {
                reject(err);
                done = true;
            }
        });
    }
}

function refresh_terms(resolve, reject, response) {
    /* gets, loads, and saves */

    if (response) {
        next(response);
    } else {
        get_response(next, reject);
    }

    function next(response) {
        request({
            headers: {'user-agent': 'node.js'},
            url: TERMS_URL,
            header: response.headers,
            json: true
        }, function(error, res, body) {
            if (error) {
                reject(error);
            }

            // load terms to memory
            for (const career of body) {
                if (career.value === "ALL") {
                    for (const term of career.terms) {
                        models.term_to_code[term.desc] = term.value;
                    }
                }
            }

            // save terms to disk asynchronously
            fs.writeFile(TERMS_PATH, JSON.stringify(models.term_to_code), function(err) {
                if (err) {
                    throw err;
                }
            });

            resolve();
        });
    }
}

function get_response(resolve, reject) {
    request.get({
        headers: {'user-agent': 'node.js'},
        url: GET_SESSION_URL
    }, (error, res, body) => {
        if (error)
            reject(error);
        else
            resolve(res);
    });
}

function load_course_data(terms, resolve, reject, refresh=false, do_refresh_terms=false) {
    let response;
    function get_response_if_first(resolve, reject) {
        if (!response) {
            get_response(res => {
                response = res;
                resolve();
            }, reject);
        } else {
            resolve();
        }
    }

    if (!fs.existsSync(TERMS_PATH)) {
        // get terms from web because we don't have them
        get_response_if_first(() => {
            refresh_terms(next, console.error, response);
        }, console.error);
    } else {
        if (refresh || do_refresh_terms) {
            // try to update terms from web as requested
            get_response_if_first(() => {
                refresh_terms(next, console.error, response);
            }, err => {
                // but if we can't, it's OK because we have them already. get terms from disk
                console.log("Cannot refresh terms from internet as requested, so loading cached version instead");
                const termsString = fs.readFileSync(TERMS_PATH);
                models.term_to_code = JSON.parse(termsString);
                next();
            });
        } else {
            // get terms from disk
            const termsString = fs.readFileSync(TERMS_PATH);
            models.term_to_code = JSON.parse(termsString);
            next();
        }
    }

    function next() {
        if (terms === undefined)
            terms = Object.keys(models.term_to_code);

        const functions_to_execute = terms.map(function(term) {
            return function(resolve, reject) {
                const courses_path = get_courses_path(term);
                const subjects_path = get_subjects_path(term);

                // function to get courses and set courses variable
                const get_courses = function(resolve, reject) {
                    if (fs.existsSync(courses_path) && !refresh) {
                        fs.readFile(courses_path, (err, coursesString) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                let coursesJson = JSON.parse(coursesString);
                                resolve(coursesJson);
                            }
                        });
                    } else {
                        get_response_if_first(() => {
                            request({
                                headers: {'user-agent': 'node.js'},
                                url: get_search_url(term),
                                header: response.headers,
                                json: true
                            }, (error, res, body) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    const courses = body.searchResults;
                                    resolve(courses);
                                    // save the data to disk asynchronously but don't wait until it is saved
                                    fs.writeFile(courses_path, JSON.stringify(courses), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }, reject);
                    }
                }

                // function to get subjects and set subjects variable
                const get_subjects = function(resolve, reject) {
                    if (fs.existsSync(subjects_path) && !refresh) {
                        fs.readFile(subjects_path, (err, subjectsString) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                let subjectsJson = JSON.parse(subjectsString);
                                resolve(subjectsJson);
                            }
                        });
                    } else {
                        get_response_if_first(() => {
                            request({
                                headers: {'user-agent': 'node.js'},
                                url: get_course_subjects_url(term),
                                header: response.headers,
                                json: true
                            }, (error, res, body) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    const subjects = {};
                                    body.forEach(function(x) {
                                        subjects[x.value] = x.desc.substring(x.value.length+3);
                                    });
                                    resolve(subjects);
                                    // save the data to disk asynchronously but don't wait until it is saved
                                    fs.writeFile(subjects_path, JSON.stringify(subjects), err => {
                                        if (err) throw err;
                                    });
                                }
                            });
                        }, reject);
                    }
                }

                all([get_courses, get_subjects], vals => {
                    const courses = vals[0];
                    const subjects = vals[1];
                    save_data(term, courses, subjects);
                    resolve(term);
                }, reject);
            }
        });
        
        // wait for them all to finish
        all(functions_to_execute, resolve, reject);
    }
}

function load_all_course_data(resolve, reject, do_refresh_terms=false) {
    load_course_data(undefined, resolve, reject, false, do_refresh_terms);
}

module.exports = {
    load_course_data,
    load_all_course_data,
    refresh_terms,
    get_response,
};
