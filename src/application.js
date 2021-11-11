const express = require('express');

// const aws = require('aws-sdk');
// const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
// aws.config.region = 'us-east-1';

// const { Client } = require('pg');
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
// });
// client.connect();

const app = express();

// To keep track of usage
// if (app.get('env') === 'production') {
// var session = require('express-session');
// var pgSession = require('connect-pg-simple')(session);
// var sess = {
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false, maxAge: null },
//   store: new pgSession({
//     conString: process.env.DATABASE_URL || 'postgresql://localhost/tuftscoursescheduler',
//     pruneSessionInterval: false
//   })
// }
// app.set('trust proxy', 1) // trust first proxy
// sess.cookie.secure = true // serve secure cookies
// app.use(session(sess))
// // app.use(function (req, res, next) {
// //     // test
// //     console.log(req.sessionID, req.headers['x-forwarded-for'] || req.socket.remoteAddress)
// //     next()
// // })
// }


const PORT = process.env.PORT || 5000;
const UPDATE_INTERVAL = 30; // every UPDATE_INTERVAL minutes it updates all the course data
const OFFLINE_MODE = false; // I use offline mode when I don't have WiFi
const USE_CDN = process.env.NODE_ENV === 'production' || !OFFLINE_MODE;

let RESOURCES_STRINGS;


// var io = require('socket.io').listen(7777);
// var count = 0
//
// io.on('connection', function(socket) {
//     count++;
//     console.log('n users:', count)
//
//     socket.on('disconnect', function(){
//         count--;
//         console.log('n users:', count)
//     })
// });


app.set('view engine', 'ejs');
app.set('views', 'src/public/views');

const sslwwwRedirect = require('./ssl-www-redirect');
app.use(sslwwwRedirect(false));

const compression = require('compression');
app.use(compression());

const threeHours = 10800000;
const oneYear = 31536000000;
app.use(express.static('src/public/js', {
    maxAge: process.env.NODE_ENV === 'production' ? threeHours : 0
}));
app.use(express.static('src/public/css', {
    maxAge: process.env.NODE_ENV === 'production' ? threeHours : 0
}));
app.use(express.static('src/public/icons', {
    maxAge: process.env.NODE_ENV === 'production' ? threeHours : 0
}));
app.use(express.static('src/public/vendor', {
    maxAge: oneYear
}));

if (!USE_CDN)
    app.use(express.static('node_modules'));

const http = require('http').createServer(app);

const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');
const schedule_stats = require('./schedule_stats');

const {default_compare, PartialSorter} = require('./partial_sort');

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

const {all, groupBy, allEqual} = require('./utils');


tic('load the data');
tic('get resources');
all([
    function(resolve, reject) {
        get_data.load_all_course_data(vals => {
            toc('load the data');
            console.log("Done loading the data");
            resolve(vals);
        }, reject,
        true // whether to refresh terms
        );
    },
    function(resolve, reject) {
        require('./resources')(USE_CDN, function(resourcesStrings) {
            toc('get resources');
            RESOURCES_STRINGS = resourcesStrings;
            resolve();
        }, reject);
    }
], function() {
    // console.log(Object.keys(models.sections));

    // models.sections['Spring 2022'] // type: Array

    // console.log(models.courses['Spring 2022'] instanceof Array);
    // console.log(models.courses['Spring 2022'].filter(x => x.course_num === 'CS-0170')[1])



    //        Investigate whether class attributes are consistent
    // function allEqual(arr, func) {
    //     if (arr.length === 0) return true;
    //     const item = arr[0];
    //     return arr.every(x => x === item);
    // }
    // for (const course of models.courses['Spring 2022']) {
    //     if (! allEqual(course.sections.map(sec => sec.class_attr))) {
    //         console.log(course);
    //     }
    // }


    //      Verify that class_attr is ALWAYS already sorted alphabetically
    // function arraysEqual(arr1, arr2) {
    //     if (arr1.length !== arr2.length) return false;
    //     for (let i = 0; i < arr1.length; i++) {
    //         if (arr1[i] !== arr2[i])
    //             return false;
    //     }
    //     return true;
    // }
    // for (const year of Object.keys(models.sections)) {
    //     for (const section of models.sections[year]) {
    //         const class_attr = section.class_attr;
    //         const class_attr_sorted = [...class_attr];
    //         class_attr_sorted.sort();
    //         if (!arraysEqual(class_attr, class_attr_sorted)) {
    //             console.log("NOT SORTED");
    //         }
    //     }
    // }

    // for (const year of Object.keys(models.courses)) {
    //     for (const course of models.courses[year]) {
    //         const sections = course.sections;
    //         const sectionsByType = groupBy(sections, section => section.component_short);
    //         const tmp = sectionsByType.map(x => x.map(y => y.SHUs));
    //         if (!tmp.every(allEqual)) {
    //             console.log(year, course.course_num, sectionsByType.map(x => [x[0].component_short, x.map(y => y.SHUs)]))
    //         }
    //     }
    // }

    
    startServer();

    // console.log(models.long_subject_to_short_subject)

    // const instructorSets = [];
    // for (const section of models.sections['Fall 2019']) {
    //     const instructors = new Set();
    //     for (const period of section.periods) {
    //         instructors.add(period.instructor);
    //     }
    //     if (instructors.size > 1)
    //         instructorSets.push(instructors);
    // }
    // console.log(instructorSets);
}, console.error);


function startServer() {
    // update all data every so often
    setInterval(function() {
        console.log("Updating all data...");
        get_data.load_course_data(undefined, ()=>{console.log("Successfully updated all data!")}, console.error, true);
    }, UPDATE_INTERVAL * 60*1000);

    app.get('/', function(req, res) {
        res.render('index', {
            terms: Object.keys(models.term_to_code),
            css: RESOURCES_STRINGS.index.css,
            js: RESOURCES_STRINGS.index.js
        });
    });

    app.get('/schedule', function(req, res) {
        if (!/^((\d+-)+\d+|\d*)$/.test(req.query.ids)
        || req.query.pref_morning === undefined
        || req.query.pref_night === undefined
        || req.query.pref_consecutive === undefined
        || req.query.accepted_statuses === undefined) {
            res.send("Wrong format!");
            return;
        }
        if (req.query.ids.length === 0) {
            res.send("No schedules selected!");
            return;
        }
        const ids = req.query.ids.split("-").map(id => parseInt(id, 10));
        const accepted_statuses = req.query.accepted_statuses.split("");

        const min_time = req.query.min_time;
        const max_time = req.query.max_time;
        const weights = {
            morningness_weight: parseInt(req.query.pref_morning, 10) / 100,
            eveningness_weight: parseInt(req.query.pref_night, 10) / 100,
            consecutiveness_weight: parseInt(req.query.pref_consecutive, 10) / 100,
        };

        // scale all weights such that the one with the greatest magnitude equals 1
        // this ensures that the scale of the given weights will be consistent
        const max_weight_magnitude = Math.max(...Object.values(weights).map(Math.abs));
        if (max_weight_magnitude !== 0)
            for (const key in weights)
                weights[key] = weights[key] / max_weight_magnitude;

        const score_function = schedule => schedule_stats.get_score(schedule, req.query.term, weights)
        const k = 300;
        var section_accept_function = function(section) {
            for (var period of section.periods)
                if (period.start < min_time || period.end > max_time)
                    return false
            return true
        }
        tic('generate schedules');
        const info = get_top_schedules_list(ids, accepted_statuses, score_function, k, section_accept_function, req.query.term);
        toc('generate schedules');
        console.log(`n schedules: ${info.n_possibilities}`);
        res.render('schedule', {
            data: JSON.stringify(info),
            n_possibilities: info.n_possibilities,
            k: k,
            css: RESOURCES_STRINGS.schedule.css,
            js: RESOURCES_STRINGS.schedule.js
        });
    });

    app.get('/search', function(req, res) {
        console.log(`search term: ${req.query.query}, term: ${req.query.term}`);
        tic('get search results');
        const search_results = api.get_search_results(req.query.query, req.query.term);
        toc('get search results');
        const search_results_json = search_results.map(course => ({
                course_num: course.course_num,
                title: course.title,
                desc_long: course.desc_long,
                id: course.id,
                class_attr: course.class_attr,
                sections: course.sections
        }));
        res.send(search_results_json);
    });

    app.get('/tell-if-mobile', function(req, res) {
        console.log('is mobile:', req.query.ismobile, req.sessionID, req.headers['x-forwarded-for'] || req.connection.remoteAddress)
        res.send('')
    });

    http.listen(PORT, function() {
        console.log(`Listening on ${PORT}`);
    });
}

function get_top_schedules_list(course_ids, accepted_statuses, score_function, k, section_accept_function, term) {
    // array of Course objects
    const courses = course_ids.map(id => models.courses[term][id]);
    // generator of "schedules" which are represented as a 2D arrays.
    // Each element of a schedule is an array containing the IDs of Sections.
    const schedules = get_schedules(courses, accepted_statuses, section_accept_function, term);
    // generator of objects with schedules and their scores
    const schedules_and_scores = (function* () {
        for (const schedule of schedules) {
            yield {
                schedule: schedule,
                score: score_function(schedule)
            };
        }
    })();
    // object that gets the k schedules with the highest scores and sorts them
    const sorter = new PartialSorter((a, b) => {
        var cmp = default_compare(b.score, a.score);
        if (cmp === 0)
            return Math.random() - 0.5;
        return cmp;
    }, k);
    sorter.insertAll(schedules_and_scores);

    return {
        n_possibilities: sorter.numPassed,
        top_schedules: sorter.getMinArray(),
        courses: courses,
        term_code: get_data.get_term_number(term)
    };
}

function get_schedules(courses, accepted_statuses, section_accept_function, term) {
    const reduced_pgs = courses.map(course => {
        const ev_pg = api.course_object_to_period_group(course, true, accepted_statuses, false, true, section_accept_function, term).evaluate();
        const section_id_to_periods_string = {};
        const grouped = groupBy(ev_pg, section_ids =>
            section_ids.map(section_id => {
                if (section_id in section_id_to_periods_string)
                    return section_id_to_periods_string[section_id];
                section_id_to_periods_string[section_id] = JSON.stringify(models.sections[term][section_id].periods);
                return section_id_to_periods_string[section_id];
            }).join('')
        );
        const selected = grouped.map(group =>
            max(group, {
                key: function(item) {
                    var k = [0, 0];
                    for (var sectionid of item) {
                        if (models.sections[term][sectionid].status === 'O') {
                            k[0]++;
                        }
                        else if (models.sections[term][sectionid].status === 'W') {
                            k[1]++;
                        }
                    }
                    return k;
                }
            })
        );
        const selected_pgs = selected.map(section_ids => new course_scheduler.PeriodGroup(section_ids, 'and', true, false, null, term));
        return new course_scheduler.PeriodGroup(selected_pgs, 'or', false, false, null, term);
    });
    const pg = new course_scheduler.PeriodGroup(
        reduced_pgs,
        'and', false, false, null, term
    );
    return pg.evaluate();
}

function max(arr, {key=x=>x, compareFunction=default_compare}={}) {
    let best = arr[0];
    let bestKey = key(best);
    for (let i = 1; i < arr.length; i++) {
        const thisKey = key(arr[i]);
        if (compareFunction(thisKey, bestKey) > 0) {
            bestKey = thisKey;
            best = arr[i];
        }
    }
    return best;
}
