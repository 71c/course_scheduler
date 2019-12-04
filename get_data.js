const request = require('request').defaults({jar: true});
const models = require('./models');

const GET_SESSION_URL = 'https://sis.uit.tufts.edu/psc/paprd/EMPLOYEE/EMPL/s/WEBLIB_TFP_PG.ISCRIPT2.FieldFormula.IScript_AutoLogOut';
const SEARCH_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSearchresultsAll3';
const DETAILS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getResultsDetails';
const COURSE_SUBJECTS_URL = 'https://siscs.uit.tufts.edu/psc/csprd/EMPLOYEE/HRMS/s/WEBLIB_CLS_SRCH.ISCRIPT1.FieldFormula.IScript_getSubjects';

const term_parser = /(spring|summer|fall|spring|annual term) (\d{4})/i;

function time() {
    return new Date().getTime();
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

function get_classes_data(term, callback) {
    request.get({
        headers: {'user-agent': 'node.js'},
        url: GET_SESSION_URL
    }, function(error, response, body) {
        request({
            headers: {'user-agent': 'node.js'},
            url: get_search_url(term),
            header: response.headers,
            json: true
        }, callback);
    });
}

function get_classes_data_and_course_subjects(term, callback_courses, callback_subjects) {
    request.get({
        headers: {'user-agent': 'node.js'},
        url: GET_SESSION_URL
    }, function(error, response, body) {
        request({
            headers: {'user-agent': 'node.js'},
            url: get_search_url(term),
            header: response.headers,
            json: true
        }, callback_courses);
        request({
            headers: {'user-agent': 'node.js'},
            url: get_course_subjects_url(term),
            header: response.headers,
            json: true
        }, callback_subjects);
    });
}

function get_and_save_data(term, callback=()=>{}) {
    let t = time();

    let courses;
    let long_subject_dict;
    let n = 0;
    get_classes_data_and_course_subjects('Spring 2020', callback_courses, callback_subjects);

    function callback_courses(error, response, body) {
        console.log(time() - t);
        console.log('got courses!');
        courses = body.searchResults;
        ++n;
        if (n === 2) when_got_data();
    }
    function callback_subjects(error, response, body) {
        console.log(time() - t);
        console.log('got subjects!');
        long_subject_dict = {};
        body.forEach(function(x) {
            long_subject_dict[x.value] = x.desc.substring(x.value.length+3);
        });
        ++n;
        if (n === 2) when_got_data();
    }

    
    function when_got_data() {
        console.log(long_subject_dict);

        models.courses = [];
        const subject_finder = /^[A-Z]+/;
        for (const course_data of courses) {
            const course_num = course_data.course_num;
            const title = course_data.course_title;
            const desc_long = course_data.desc_long;
            const subject = subject_finder.exec(course_num)[0];
            const subject_long = long_subject_dict[subject];
            const course = new models.Course(course_num, subject, subject_long, title, desc_long);
            for (const section of course_data.sections) {
                const comp_desc = section.comp_desc;
                for (const component_data of section.components) {
                    const assoc_class = component_data.assoc_class;
                    const class_num = component_data.class_num;
                    const comp_desc_short = component_data.ssr_comp;
                    const section_num = component_data.section_num;
                    const component_short = component_data.ssr_comp;
                    const status = component_data.status;
                    const section = new models.Section(class_num, section_num, assoc_class, comp_desc, component_short, status);
                    for (const location of component_data.locations) {
                        for (const meeting of location.meetings) {
                            for (const day of meeting.days) {
                                section.add_period(day, meeting.meet_start_min, meeting.meet_end_min);
                            }
                        }
                    }
                    course.add_section(section);
                }
            }
            models.courses.push(course);
        }
        console.log(time() - t);
        console.log('done getting data!!!');
        callback();
    }
}


module.exports = {
    get_and_save_data: get_and_save_data
};



