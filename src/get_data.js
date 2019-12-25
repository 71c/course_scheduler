




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
const CACHE_DATA = true;
// whether to use the cached data (assuming it exists) if cannot get data from the web
const USE_CACHED_DATA_IF_FAIL = true;
// whether to use the cached data always even if can get data from the web; this is helpful when developing
const ALWAYS_USE_CACHED_DATA = true;

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

async function get_and_save_data(term, callbackSuccess=()=>{}, callbackFail=()=>{}) {
    if (ALWAYS_USE_CACHED_DATA) {
        getCachedData();
        return;
    }

    tic();
    let courses;
    let long_subject_dict;
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
                long_subject_dict = {};
                body.forEach(function(x) {
                    long_subject_dict[x.value] = x.desc.substring(x.value.length+3);
                });
            })()
        ]);
    } catch(error) {
        console.log(error);
        if (USE_CACHED_DATA_IF_FAIL) {
            console.log("could not get data online; using cached data")
            getCachedData();
        } else {
            console.log("could not get data online; failed to get data");
            callbackFail();
        }
        return;
    }
    when_got_data(courses, long_subject_dict);

    function getCachedData() {
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
        when_got_data(coursesData, subjectsData);
    }
    
    function when_got_data(courses, long_subject_dict) {
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
        toc();
        if (CACHE_DATA) {
            let n = 0;
            fs.writeFile(get_courses_path(term), JSON.stringify(courses), function(err) {
                if (err) throw err;
                if (++n === 2) console.log("saved data to disk");
            });
            fs.writeFile(get_subjects_path(term), JSON.stringify(long_subject_dict), function(err) {
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
