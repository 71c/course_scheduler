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

    // TODO: get this from the user
    const score_function = _ => Math.random();
    const k = 100;
    var section_accept_function = function(section) {
        for (var period of section.periods)
            if (period.start < min_time || period.end > max_time)
                return false
        return true
    }
    tic('generate schedules');
    const info = get_top_schedules_list(ids, accepted_statuses, score_function, k, section_accept_function);
    toc('generate schedules');
    console.log(`n schedules: ${info.n_possibilities}`);
    res.render('schedule', {data: JSON.stringify(info)});
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
        console.log("success...will send message that data was updated");
        res.send('updated data');
    }, function() {
        console.log("failure...will send message that data was not updated");
        res.send('failed to update data');
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

function get_top_schedules_list(course_ids, accepted_statuses, score_function, k, section_accept_function) {
    // array of Course objects
    const courses = course_ids.map(id => models.courses[id]);
    // generator of "schedules" which are represented as a 2D arrays.
    // Each element of a schedule is an array containing the IDs of Sections.
    const schedules = get_schedules(courses, accepted_statuses, section_accept_function);
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

function get_schedules(courses, accepted_statuses, section_accept_function) {
    const pg = new course_scheduler.PeriodGroup(
        courses.map(course => {
            return api.course_object_to_period_group(course, true, accepted_statuses, cache=false, give_ids=true, section_accept_function)
        }),
        'and', merge=false, cache=false
    );
    return pg.evaluate();
}
