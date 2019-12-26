




// todo
// https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getCareers?callback=jQuery18206097945204799431_1577067419747&_=1577067420874




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

// whether to cache the data whenever we get it
// const CACHE_DATA = true;
// whether to use the cached data (assuming it exists) if cannot get data from the web
const USE_CACHED_DATA_IF_FAIL = true;
// whether to use the cached data always even if can get data from the web; this is helpful when developing
const ALWAYS_USE_CACHED_DATA = false;

// const COURSES_PATH = 'courses_data/courses.json';
// const SUBJECTS_PATH = 'courses_data/subjects.json';

const get_courses_path = term => `courses_data/courses_${term}.json`;
const get_subjects_path = term => `courses_data/subjects_${term}.json`;
const TERMS_PATH = 'courses_data/terms.json';


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

// function load_course_data(terms, refresh=false) {
//     let response;
//     function get_response_if_first() {
//         if (response) {
//             return Promise.resolve('resolve');
//         } else {
//             return new Promise((resolve, reject) => {
//                 rp.get({
//                     headers: {'user-agent': 'node.js'},
//                     url: GET_SESSION_URL,
//                     resolveWithFullResponse: true
//                 }).then(r => {
//                     response = r;
//                     resolve();
//                 }).catch(err => {
//                     console.log(err);
//                     reject();
//                 });
//             });
//         }
//     }

//     if (fs.existsSync(TERMS_PATH) && !refresh) {
//         const termsString = fs.readFileSync(TERMS_PATH);
//         models.term_to_code = JSON.parse(termsString);
//     } else {
//         console.log("SECOND");

//         // get terms from web
//         get_response_if_first().then(() => {
//             // refresh_terms(response)

//             let body = rp({
//                 headers: {'user-agent': 'node.js'},
//                 url: TERMS_URL,
//                 header: response.headers,
//                 json: true
//             });
//             console.log("got terms");

//             // load terms to memory
//             for (const career of body) {
//                 if (career.value === "ALL") {
//                     for (const term of career.terms) {
//                         models.term_to_code[term.desc] = term.value;
//                     }
//                 }
//             }

//             // save terms to disk asynchronously
//             fs.writeFile(TERMS_PATH, JSON.stringify(models.term_to_code), function(err) {
//                 if (err) {
//                     throw err;
//                 }
//             });
//         })

//         console.log("THIRD");

//         await refresh_terms(response);
//         console.log("YEH")
//     }


// }





async function get_session() {
    let response = await rp.get({
        headers: {'user-agent': 'node.js'},
        url: GET_SESSION_URL,
        resolveWithFullResponse: true
    });
    return response;
}

async function refresh_terms(response) {
    /* gets, loads, and saves */
    let body = rp({
        headers: {'user-agent': 'node.js'},
        url: TERMS_URL,
        header: response.headers,
        json: true
    });
    console.log("got terms");

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
}

async function load_all_course_data() {
    load_course_data();
}

async function refresh_everything() {

    load_course_data(undefined, true);
}

async function load_course_data(terms, refresh=false) {
    let response;
    async function get_response_if_first() {
        if (!response) {
            response = await get_session();
        }
    }

    console.log("FIRST ")

    // Load terms into memory from file. If the file does not exist, try to get it from the server, load terms into memory, and save terms
    // try {
    //     const termsString = fs.readFileSync(TERMS_PATH);
    //     models.term_to_code = JSON.parse(termsString);
    // } catch (err) {
    //     // if terms file does not exist, get it
    //     if (err.code === "ENOENT") {
    //         console.log(`File ${err.path} does not exist; getting from web...`);
    //         // get terms from web
    //         await get_response_if_first();
    //         await refresh_terms(response);
    //     }
    //     else {
    //         throw err;
    //     }
    // }

    try {
        // Load terms into memory from file. If the file does not exist, try to get it from the server, load terms into memory, and save terms
        if (fs.existsSync(TERMS_PATH) && !refresh) {
            const termsString = fs.readFileSync(TERMS_PATH);
            models.term_to_code = JSON.parse(termsString);
        } else {
            console.log("SECOND");

            // get terms from web
            var yoe = await get_response_if_first();

            console.log("THIRD");

            await refresh_terms(response);
            console.log("YEH")
        }
    } catch (err) {
        console.error(err);
    }
    console.log("YOH")

    if (terms === undefined)
        terms = Object.keys(models.term_to_code);

    const functions_to_execute = terms.map(function(term) {
        console.log("yuh")
        return (async function() {
            const courses_path = get_courses_path(term);
            const subjects_path = get_subjects_path(term);

            let courses;
            let subjects = {};

            // function to get courses and set courses variable
            const get_courses = async function() {
                if (fs.existsSync(courses_path) && !refresh) {
                    const coursesString = await fs.promises.readFile(courses_path);
                    courses = JSON.parse(coursesString);
                } else {
                    await get_response_if_first();
                    const body = await rp({
                        headers: {'user-agent': 'node.js'},
                        url: get_search_url(term),
                        header: response.headers,
                        json: true
                    });
                    console.log(`got courses data for ${term}`)
                    courses = body.searchResults;

                    // save the data to disk asynchronously but don't wait until it is saved
                    fs.promises.writeFile(courses_path, JSON.stringify(courses));
                }
            }

            // function to get subjects and set subjects variable
            const get_subjects = async function() {
                if (fs.existsSync(subjects_path) && !refresh) {
                    const subjectsString = await fs.promises.readFile(subjects_path);
                    subjects = JSON.parse(subjectsString);
                } else {
                    await get_response_if_first();
                    const body = await rp({
                        headers: {'user-agent': 'node.js'},
                        url: get_course_subjects_url(term),
                        header: response.headers,
                        json: true
                    });
                    console.log(`got subjects data for ${term}`)
                    body.forEach(function(x) {
                        subjects[x.value] = x.desc.substring(x.value.length+3);
                    });

                    // save the data to disk asynchronously but don't wait until it is saved
                    fs.promises.writeFile(subjects_path, JSON.stringify(subjects));
                }
            }

            try {
                // get courses and subjects, wait until we got both
                await Promise.all([get_courses(), get_subjects()]);
                // when we got courses and subjects, put the courses in memory in our format
                save_data_new(term, courses, subjects);
            } catch (err) {
                if (err.error.code === "ENOTFOUND") {
                    console.log("can't get data from internet!");
                } else {
                    console.error(err);
                }
            }
        })() // right now, this function has started executing
    });

    console.log("yooh")

    // wait for them all to finish
    await Promise.all(functions_to_execute);
    console.log("actualy done");

}


async function get_and_save_data(term, callbackSuccess=()=>{}, callbackFail=()=>{}) {
    if (ALWAYS_USE_CACHED_DATA) {
        getCachedData(term, callbackSuccess, callbackFail);
        return;
    }

    tic();
    let courses;
    let long_subject_dict = {};
    try {
        let response = await rp.get({
            headers: {'user-agent': 'node.js'},
            url: GET_SESSION_URL,
            resolveWithFullResponse: true
        });

        await Promise.all([
            (async function() {
                let body = await rp({
                    headers: {'user-agent': 'node.js'},
                    url: get_search_url(term),
                    header: response.headers,
                    json: true
                });
                toc();
                console.log('got courses!');
                courses = body.searchResults;
            })(),
            (async function() {
                let body = await rp({
                    headers: {'user-agent': 'node.js'},
                    url: get_course_subjects_url(term),
                    header: response.headers,
                    json: true
                });
                toc();
                console.log('got subjects!');
                body.forEach(function(x) {
                    long_subject_dict[x.value] = x.desc.substring(x.value.length+3);
                });
            })(),
            (async function() {
                let body = await rp({
                    headers: {'user-agent': 'node.js'},
                    url: TERMS_URL,
                    header: response.headers,
                    json: true
                });
                toc();
                console.log('got terms!');
                for (const career of body) {
                    if (career.value === "ALL") {
                        for (const term of career.terms) {
                            models.term_number_dict[term.desc] = term.value;
                        }
                    }
                }
            })()
        ]);
    } catch(error) {
        console.log(error);
        if (USE_CACHED_DATA_IF_FAIL) {
            console.log("could not get data online; using cached data")
            getCachedData(term, callbackSuccess, callbackFail);
        } else {
            console.log("could not get data online; failed to get data");
            callbackFail();
        }
        return;
    }
    save_data(term, courses, long_subject_dict, callbackSuccess);
}

function getCachedData(term, callbackSuccess, callbackFail) {
    try {
        var coursesString = fs.readFileSync(get_courses_path(term));
        var subjectsString = fs.readFileSync(get_subjects_path(term));
    } catch(err) {
        if (err.code === "ENOENT") {
            console.log(err);
            callbackFail();
            return;
        }
        else {
            throw err;
        }
    }
    var coursesData = JSON.parse(coursesString);
    var subjectsData = JSON.parse(subjectsString);
    save_data(term, coursesData, subjectsData, callbackSuccess);
}

function save_data_new(term, courses, long_subject_dict) {
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

function save_data(term, courses, long_subject_dict, callback) {
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

    let n = 0;
    fs.writeFile(get_courses_path(term), JSON.stringify(courses), function(err) {
        if (err) throw err;
        if (++n === 2) console.log("saved data to disk");
    });
    fs.writeFile(get_subjects_path(term), JSON.stringify(long_subject_dict), function(err) {
        if (err) throw err;
        if (++n === 2) console.log("saved data to disk");
    });

    console.log('done getting data!!!');
    callback();
}

module.exports = {
    get_and_save_data: get_and_save_data,
    load_all_course_data: load_all_course_data
};
