const express = require('express');
const app = express();

// https://www.tiktip.com/a/1/4/15/1
const mustacheExpress = require('mustache-express');
app.engine('html', mustacheExpress());
app.use(express.static('src/public'));
app.use(express.static('node_modules'));
app.set('view engine', 'html');
app.set('views', 'src/public');

const http = require('http').createServer(app);

const assert = require('assert');
const fs = require('fs');

const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');
const evaluation_timing_test = require('./some_tests').evaluation_timing_test;

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


app.get('/', function(req, res) {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.get('/schedule', function(req, res) {
    const ids = JSON.parse(req.query.ids).map(id => parseInt(id, 10));
    const accepted_statuses = JSON.parse(req.query.accepted_statuses);
    console.log(ids);
    console.log(accepted_statuses);

    // TODO: get this from the user
    const score_function = _ => Math.random();
    const k = 100;
    tic('new version');
    const info = get_top_schedules_list(ids, accepted_statuses, score_function, k);
    toc('new version');
    console.log(`n schedules: ${info.n_possibilities}`);

    // res.sendFile(path.resolve(__dirname, 'public/schedule.html'));

    // res.send(info);

    // res.sendFile(path.resolve(__dirname, 'public/schedule.html'));
    res.render('schedule', {data: JSON.stringify(info)});
});

app.get('/get_schedules', function(req, res) {
    console.log("Got request to gnerate schedules");

    const ids = req.query.ids.map(id => parseInt(id, 10));
    const accepted_statuses = req.query.accepted_statuses;
    // TODO: get this from the user
    const score_function = _ => Math.random();
    const k = 100;
    tic('new version');
    const info = get_top_schedules_list(ids, accepted_statuses, score_function, k);
    toc('new version');
    console.log(`n schedules: ${info.n_possibilities}`);
    res.send(info);
    // res.sendFile(path.resolve(__dirname, 'public/schedule.html'));
});

app.get('/search/:term', function(req, res) {
    console.log(`search term: ${req.params.term}`);
    const search_results = api.get_search_results(req.params.term);
    const search_results_json = search_results.map(course => ({
            course_num: course.course_num,
            title: course.title,
            desc_long: course.desc_long,
            id: course.id
    }));
    res.send(search_results_json);
});

app.get('/updatedata', function(req, res) {
    console.log('going to update data...');
    get_data.get_and_save_data('Spring 2020', function() {
        res.send('updated data');
    }, function() {
        res.send('failed to update data');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});


function get_top_schedules_list(course_ids, accepted_statuses, score_function, k) {
    // array of Course objects
    const courses = course_ids.map(id => models.courses[id]);
    // generator of "schedules" which are represented as a 2D arrays.
    // Each element of a schedule is an array containing the IDs of Sections.
    const schedules = get_schedules(courses, accepted_statuses);
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
    const sorter = new PartialSorter((a, b) => default_compare(b.score, a.score), k);
    sorter.insertAll(schedules_and_scores);
    return {
        n_possibilities: sorter.numPassed,
        top_schedules: sorter.getMinArray(),
        courses: courses
    };
}

function get_schedules(courses, accepted_statuses) {
    const pg = new course_scheduler.PeriodGroup(
        courses.map(course => api.course_object_to_period_group(course, true, accepted_statuses, cache=false, give_ids=true)),
        'and', merge=false, cache=false
    );
    return pg.evaluate();
}
