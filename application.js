const express = require('express');
const app = express();
app.use(express.static('static'));
const http = require('http').createServer(app);

const assert = require('assert');
const fs = require('fs');

const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');
const evaluation_timing_test = require('./some_tests').evaluation_timing_test;


function time() {
    return Date.now();
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/templates/index.html');
});

app.get('/get_schedules', function(req, res) {
  console.log("Got request to gnerate schedules");

  const ids = req.query.ids.map(id => parseInt(id, 10));
  const courses = [];
  for (const id of ids)
    courses.push(models.courses[id]);
  const schedules = get_schedules(courses, ['O', 'C', 'W']);
  let t = time();
  const schedules_list = [];
  for (const s of schedules) {
    schedules_list.push(s);
  }
  console.log("time taken:", time() - t)
  console.log("number of schedules:", schedules_list.length);
  if (schedules_list.length < 100)
    console.log(schedules_list);









  
  // const [courses, schedules] = get_schedules(ids, ['O', 'C', 'W']);
  // let t = time();
  // const schedules_list = [];
  // for (const s of schedules) {
  //   schedules_list.push(s);
  // }
  // console.log("time taken:", time() - t)
  // console.log("number of schedules:", schedules_list.length);
  // console.log(schedules_list);


  

  // const sections_by_id_to_send = {};
  // for (const course of courses)
  //   for (const section of course.sections)
  //     sections_by_id_to_send[section.id] = section;
  // console.log("sections string length:", JSON.stringify(sections_by_id_to_send).length);
  // console.log("schedules string length:", JSON.stringify(schedules_list).length);


  // // get courses
  // const courses = [];
  // for (const id of ids)
  //   courses.push(models.courses[id]);
  // // redo ids to start from 0
  // const id_to_id = {};
  // const sections_by_id_to_send = {};
  // let curr_id = 0;
  // for (const course of courses) {
  //   for (const section of course.sections) {
  //     id_to_id[section.id] = curr_id++;
  //     sections_by_id_to_send[curr_id] = section;
  //   }
  // }
  // const schedules = get_schedules(courses, ['O', 'C', 'W']);
  // let t = time();
  // const schedules_list = [];
  // var nums_iterable = function*() {
  //   for (const s of get_schedules(courses, ['O', 'C', 'W']))
  //     for (const subschedule of s)
  //       for (const num of subschedule)
  //         yield 0;
  // }();
  // var nums = new Uint16Array(nums_iterable);

  // var nums = new Uint16Array(138489510);
  // var n = 0;
  // for (const s of get_schedules(courses, ['O', 'C', 'W'])) {
  //   for (const subschedule of s) {
  //     for (const num of subschedule) {
  //       nums[++n] = id_to_id[num];
  //     }
  //   }
  // }
  // res.send(nums);

  

  // console.log("sections string length:", JSON.stringify(sections_by_id_to_send).length);
  // console.log("schedules string length:", schedules_string.length);
  // if (schedules_string.length > 400)
  //   console.log(schedules_string.slice(0, 400));
  // else
  //   console.log(schedules_string);


  // let n = 0;
  // for (const s of get_schedules(courses, ['O', 'C', 'W']))
  //   for (const subschedule of s)
  //     for (const num of subschedule)
  //       n++;
  // console.log("IS HOW MANY:", n);


  // console.log(schedules);
  // console.log(JSON.stringify(schedules));
  // let t = time();
  // const schedules_ids = schedules.map(schedule => schedule.map(sections => sections.map(section => section.id)));
  // console.log(time() - t);
  // console.log(schedules_ids);

  res.send({});
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
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

function get_schedules(courses, accepted_statuses) {
  const pg = new course_scheduler.PeriodGroup(
    courses.map(course => api.course_object_to_period_group(course, true, accepted_statuses, cache=false, give_ids=true)),
    'and', merge=false, cache=false
  );
  return pg.evaluate();
}

// function get_schedules(course_ids, accepted_statuses) {
//   // const courses = models.courses.filter(course => course_ids.includes(course.id));
//   const courses = [];
//   for (const id of course_ids)
//     courses.push(models.courses[id]);
//   const pg = new course_scheduler.PeriodGroup(
//     courses.map(course => api.course_object_to_period_group(course, true, accepted_statuses, cache=false, give_ids=true)),
//     'and', merge=false, cache=false
//   );
//   return [courses, pg.evaluate()];
// }
