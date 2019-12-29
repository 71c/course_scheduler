const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

// // https://www.tiktip.com/a/1/4/15/1
// const mustacheExpress = require('mustache-express');
// app.engine('html', mustacheExpress());
// app.set('view engine', 'html');

app.set('view engine', 'ejs');

app.use(express.static('src/public'));
app.use(express.static('node_modules'));
app.set('views', 'src/public');

const http = require('http').createServer(app);

const assert = require('assert');
const fs = require('fs');

const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');
const evaluation_timing_test = require('./some_tests').evaluation_timing_test;
const schedule_stats = require('./schedule_stats');

const {default_compare, basic_compare, PartialSorter} = require('./partial_sort');

const path = require('path');


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

function minutesToTimeString12hr(minutes) {
    var minutePart = minutes % 60;
    var hourPart = Math.floor(minutes / 60) % 24;
    var amPm = hourPart >= 12 ? "PM" : "AM";
    hourPart = hourPart % 12;
    if (hourPart === 0)
        hourPart = 12;
    var hourPartString = hourPart.toString();
    var minutePartString = minutePart > 9 ? minutePart.toString() : "0" + minutePart.toString();
    return hourPartString + ":" + minutePartString + amPm;
}

tic('load the data')
get_data.load_all_course_data(vals => {
    toc('load the data');
    console.log("Done loading the data");

    startServer();

    // console.log("finding duplicate courses...");
    // for (const term in models.term_to_code) {
    //     console.log(`${term}:`);
    //     const course_name_to_count = {};
    //     for (const course of models.courses[term]) {
    //         const course_num = course.course_num + course.title;
    //         if (course_num in course_name_to_count)
    //             course_name_to_count[course_num] += 1;
    //         else
    //             course_name_to_count[course_num] = 1;
    //     }
    //     for (const course_num in course_name_to_count) {
    //         if (course_name_to_count[course_num] > 1)
    //             console.log(`\t${course_num}`);
    //     }
    // }

    // let min_start = 1440;
    // let min_end = 1440;
    // let max_start = 0;
    // let max_end = 0;
    // for (const section of models.sections['Spring 2020']) {
    //     for (const period of section.periods) {
    //         if (period.start < min_start && period.start !== 0)
    //             min_start = period.start;
    //         if (period.end < min_end && period.end !== 0)
    //             min_end = period.end;
    //         if (period.start > max_start)
    //             max_start = period.start;
    //         if (period.end > max_end)
    //             max_end = period.end;
    //         if (period.start < 300)
    //             console.log(section);
    //     }
    // }
    // console.log(`min start: ${minutesToTimeString12hr(min_start)}`);
    // console.log(`min end: ${minutesToTimeString12hr(min_end)}`);
    // console.log(`max start: ${minutesToTimeString12hr(max_start)}`);
    // console.log(`max end: ${minutesToTimeString12hr(max_end)}`);
}, console.error, false);

function startServer() {
    // updated all data every so often
    setInterval(function() {
        console.log("Updating all data...");
        get_data.load_course_data(undefined, ()=>{console.log("Successfully updated all data!")}, console.error, true);
    }, 60 * 5 * 1000);

    app.get('/', function(req, res) {
        res.render('index', {terms: Object.keys(models.term_to_code)});
    });

    app.get('/schedule', function(req, res) {
        console.log(req.query);


        if (!/^((\d+-)+\d+|\d*)$/.test(req.query.ids)) {
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

        // TODO: get this from the user
        // const score_function = _ => Math.random();
        const score_function = schedule => schedule_stats.get_score(schedule, req.query.term, weights)
        const k = 100;
        var section_accept_function = function(section) {
            for (var period of section.periods)
                if (period.start < min_time || period.end > max_time)
                    return false
            return true
        }
        // tic('generate schedules');
        const info = get_top_schedules_list(ids, accepted_statuses, score_function, k, section_accept_function, req.query.term);
        // toc('generate schedules');
        console.log(`n schedules: ${info.n_possibilities}`);
        res.render('schedule', {data: JSON.stringify(info)});
    });

    app.get('/search', function(req, res) {
        console.log(`search term: ${req.query.query}, term: ${req.query.term}`);
        const search_results = api.get_search_results(req.query.query, req.query.term);
        const search_results_json = search_results.map(course => ({
                course_num: course.course_num,
                title: course.title,
                desc_long: course.desc_long,
                id: course.id
        }));
        res.send(search_results_json);
    });

    http.listen(PORT, function() {
        console.log(`Listening on ${PORT}`);
    });

    function get_top_schedules_list(course_ids, accepted_statuses, score_function, k, section_accept_function, term) {   tic('generate schedules');
        // array of Course objects
        const courses = course_ids.map(id => models.courses[term][id]);
        // generator of "schedules" which are represented as a 2D arrays.
        // Each element of a schedule is an array containing the IDs of Sections.
        const schedules = get_schedules(courses, accepted_statuses, section_accept_function, term);                      toc('generate schedules');  tic('sort schedules');
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
        sorter.insertAll(schedules_and_scores);                                                                          toc('sort schedules');
        return {
            n_possibilities: sorter.numPassed,
            top_schedules: sorter.getMinArray(),
            courses: courses
        };
    }

    function get_schedules(courses, accepted_statuses, section_accept_function, term) {
        const pg = new course_scheduler.PeriodGroup(
            courses.map(course => 
                api.course_object_to_period_group(course, true, accepted_statuses, cache=false, give_ids=true, section_accept_function, term)
            ),
            'and', merge=false, cache=false, null, term
        );
        return pg.evaluate();
    }
}
