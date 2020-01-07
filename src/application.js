const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000;
const UPDATE_INTERVAL = 30; // every UPDATE_INTERVAL minutes it updates all the course data

app.set('view engine', 'ejs');
app.set('views', 'src/public');

function sslwwwRedirect(useWWW) {
    var checkWWW = useWWW ?
        req => req.subdomains.length === 0 : // no www
        req => req.subdomains.length === 1 && req.subdomains[0] === 'www'; // there is www
    var changeWWW = useWWW ? 
        req => 'https://www.' + req.headers.host + req.originalUrl : // add www back
        req => 'https://' + req.headers.host.slice(4) + req.originalUrl; // remove www
    return function(req, res, next) {
        if (req.hostname === 'localhost' || process.env.NODE_ENV === 'development')
            // don't redirect if http://localhost or development
            next();
        else if (checkWWW(req))
            res.redirect(301, changeWWW(req));
        else if ((req.headers['x-forwarded-proto'] || req.protocol) === 'https')
            // uses https and there is no www; don't redirect
            next();
        else
            // using http; redirect to use https
            res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    };
}
app.use(sslwwwRedirect(false));

const compression = require('compression');
app.use(compression());

app.use(express.static('src/public'));
app.use(express.static('node_modules'));

const http = require('http').createServer(app);

const assert = require('assert');
const fs = require('fs');

const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');
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
function groupBy(items, groupFunction) {
    const map = new Map();
    for (const item of items) {
        const value = groupFunction(item);
        if (map.has(value)) {
            map.get(value).push(item);
        } else {
            map.set(value, [item]);
        }
    }
    return [...map.values()];
}

tic('load the data')
get_data.load_all_course_data(vals => {
    toc('load the data');
    console.log("Done loading the data");
    startServer();
}, console.error, false);

function startServer() {
    // update all data every so often
    setInterval(function() {
        console.log("Updating all data...");
        get_data.load_course_data(undefined, ()=>{console.log("Successfully updated all data!")}, console.error, true);
    }, UPDATE_INTERVAL * 60*1000);

    app.get('/', function(req, res) {
        res.render('index', {terms: Object.keys(models.term_to_code)});
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
        const weights = {
            morningness_weight: parseInt(req.query.pref_morning, 10) / 100,
            eveningness_weight: parseInt(req.query.pref_night, 10) / 100,
            consecutiveness_weight: parseInt(req.query.pref_consecutive, 10) / 100,
        };

        // const score_function = _ => Math.random();
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
        res.render('schedule', {data: JSON.stringify(info), n_possibilities: info.n_possibilities, k: k});
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

function get_top_schedules_list_timing_test(course_ids, accepted_statuses, score_function, k, section_accept_function, term) {
    /* TIMING TEST - NOT FOR PRODUCTION */
    const courses = course_ids.map(id => models.courses[term][id]);

    const schedules1 = get_schedules(courses, accepted_statuses, section_accept_function, term);
    const schedules2 = get_schedules(courses, accepted_statuses, section_accept_function, term);
    const schedules3 = get_schedules(courses, accepted_statuses, section_accept_function, term);

    const schedules_and_scores2 = (function* () {
        for (const schedule of schedules2) {
            yield {
                schedule: schedule,
                score: score_function(schedule)
            };
        }
    })();
    const schedules_and_scores3 = (function* () {
        for (const schedule of schedules3) {
            yield {
                schedule: schedule,
                score: score_function(schedule)
            };
        }
    })();

    const sorter3 = new PartialSorter((a, b) => {
        var cmp = default_compare(b.score, a.score);
        if (cmp === 0)
            return Math.random() - 0.5;
        return cmp;
    }, k);

    tic('schedule generate');
    for (const s of schedules1) {

    }
    toc('schedule generate');

    tic('schedule generate and add score');
    for (const s of schedules_and_scores2) {

    }
    toc('schedule generate and add score');

    tic('schedule generate and add score and sort');
    sorter3.insertAll(schedules_and_scores3);
    toc('schedule generate and add score and sort');

    return {
        n_possibilities: sorter3.numPassed,
        top_schedules: sorter3.getMinArray(),
        courses: courses
    };
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
