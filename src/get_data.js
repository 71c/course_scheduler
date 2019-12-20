const request = require('request').defaults({jar: true});
const fs = require('fs');
const models = require('./models');

const GET_SESSION_URL = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_TFP_PG.ISCRIPT2.FieldFormula.IScript_AutoLogOut';
const SEARCH_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3';
const DETAILS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getResultsDetails';
const COURSE_SUBJECTS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSubjects';

const term_parser = /(spring|summer|fall|spring|annual term) (\d{4})/i;

// whether to cache the data whenever we get it
const CACHE_DATA = true;
// whether to use the cached data (assuming it exists) if cannot get data from the web
const USE_CACHED_DATA_IF_FAIL = true;
// whether to use the cached data always even if can get data from the web; this is helpful when developing
const ALWAYS_USE_CACHED_DATA = false;

const COURSES_PATH = 'courses_data/courses.json';
const SUBJECTS_PATH = 'courses_data/subjects.json';


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

function get_classes_data_and_course_subjects(term, callback, callbackFail) {
    tic();

    let courses;
    let long_subject_dict;
    let n = 0;
    let nTriesCourses = 0;
    let nTriesSubjects = 0;
    let nTriesSession = 0;
    let maxTries = 0;

    get_session();

    function get_session() {
        request.get({
            headers: {'user-agent': 'node.js'},
            url: GET_SESSION_URL
        }, callback_get_session);
    }

    function callback_get_session(error, response, body) {
        if (error) {
            console.log(error);
            if (nTriesSession++ === maxTries) {
                callbackFail();
                return;
            }
            get_session();
            return;
        }
        get_courses(response);
        get_subjects(response);
    }

    function get_courses(response) {
        request({
            headers: {'user-agent': 'node.js'},
            url: get_search_url(term),
            header: response.headers,
            json: true
        }, callback_courses);
    }
    function get_subjects(response) {
        request({
            headers: {'user-agent': 'node.js'},
            url: get_course_subjects_url(term),
            header: response.headers,
            json: true
        }, callback_subjects);
    }

    function callback_courses(error, response, body) {
        toc();
        if (error) {
            console.log(error);
            if (nTriesCourses++ === maxTries) {
                callbackFail();
                return;
            }
            get_courses(response);
            return;
        }
        console.log('got courses!');
        courses = body.searchResults;
        if (++n === 2) callback(courses, long_subject_dict);
    }
    function callback_subjects(error, response, body) {
        toc();
        if (error) {
            console.log(error);
            if (nTriesSubjects++ === maxTries) {
                callbackFail();
                return;
            }
            get_subjects(response);
            return;
        }
        console.log('got subjects!');
        long_subject_dict = {};
        body.forEach(function(x) {
            long_subject_dict[x.value] = x.desc.substring(x.value.length+3);
        });
        if (++n === 2) callback(courses, long_subject_dict);
    }
}

function get_and_save_data(term, callbackSuccess=()=>{}, callbackFail=()=>{}) {
    if (ALWAYS_USE_CACHED_DATA) {
        getCachedData();
        return;
    }

    get_classes_data_and_course_subjects(term, when_got_data, function() {
        if (USE_CACHED_DATA_IF_FAIL) {
            console.log("could not get data online; using cached data")
            getCachedData();
        } else {
            console.log("could not get data online; failed to get data");
            callbackFail();
        }
    });

    function getCachedData() {
        let n = 0;
        let failed = false;
        var coursesData, sectionsData;
        fs.readFile(COURSES_PATH, function(err, data) {
            if (err) {
                if (failed)
                    return;
                if (err.code === "ENOENT") {
                    failed = true;
                    console.log(err);
                    console.log(`file ${COURSES_PATH} does not exist. Failed to get data.`);
                    callbackFail();
                    return;
                }
                else {
                    throw err;
                }
            }
            coursesData = JSON.parse(data);
            if (++n === 2) when_got_data(coursesData, sectionsData);
        });
        fs.readFile(SUBJECTS_PATH, function(err, data) {
            if (err) {
                if (failed)
                    return;
                if (err.code === "ENOENT") {
                    failed = true;
                    console.log(err);
                    console.log(`file ${SUBJECTS_PATH} does not exist. Failed to get data.`);
                    callbackFail();
                    return;
                }
                else {
                    throw err;
                }
            }
            sectionsData = JSON.parse(data);
            if (++n === 2) when_got_data(coursesData, sectionsData);
        });
    }
    
    function when_got_data(courses, long_subject_dict) {
        models.courses = [];
        const subject_finder = /^[A-Z]+/;
        for (const course_data of courses) {
            const subject = subject_finder.exec(course_data.course_num)[0];
            const subject_long = long_subject_dict[subject];
            const course = new models.Course(course_data.course_num, subject,
                subject_long, course_data.course_title, course_data.desc_long);
            for (const section of course_data.sections) {
                const comp_desc = section.comp_desc;
                for (const component_data of section.components) {
                    const component_short = component_data.ssr_comp;
                    const section = new models.Section(component_data.class_num,
                        component_data.section_num, component_data.assoc_class,
                        comp_desc, component_short, component_data.status);
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
                    models.sections.push(section);
                }
            }
            models.courses.push(course);
        }
        toc();
        if (CACHE_DATA) {
            let n = 0;
            fs.writeFile(COURSES_PATH, JSON.stringify(courses), function(err) {
                if (err) throw err;
                if (++n === 2) console.log("saved data to disk");
            });
            fs.writeFile(SUBJECTS_PATH, JSON.stringify(long_subject_dict), function(err) {
                if (err) throw err;
                if (++n === 2) console.log("saved data to disk");
            });
        }
        console.log('done getting data!!!');
        callbackSuccess();
    }
}

module.exports = {
    get_and_save_data: get_and_save_data
};
