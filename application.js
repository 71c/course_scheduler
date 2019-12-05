const express = require('express');
const app = express();
app.use(express.static('static'));
const http = require('http').createServer(app);
var io = require('socket.io')(http);

const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');
const evaluation_timing_test = require('./some_tests').evaluation_timing_test;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/templates/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('update data', function() {
    console.log('going to update data...');
    get_data.get_and_save_data('Spring 2020');
  });
  socket.on('search', function(msg) {
    console.log(`search term: ${msg.term}`);
    const search_results = api.get_search_results(msg.term);
    const search_results_json = search_results.map(course => ({
        course_num: course.course_num,
        title: course.title,
        desc_long: course.desc_long,
        id: course.id
    }));
    // evaluation_timing_test(['CHEM-0001', 'CHEM-0002', 'SPN-0002', 'SPN-0004']);
    // the following doesn't work: it runs out of memory!
    // evaluation_timing_test(['CHEM-0001', 'CHEM-0002', 'SPN-0002', 'SPN-0004', 'SPN-0021']);
    io.emit('results', search_results_json);
  });
  socket.on('get schedules', function(msg) {
    console.log(msg);
    const schedules = get_schedules(msg, new Set(['O', 'C', 'W']));
    console.log(schedules);
    console.log(JSON.stringify(schedules[0]));
  });
});

// app.post('/test', function(req, res) {
//   res.json({data: "your data here"});
// });

app.get('/searching', function(req, res){
 res.send("WHEEE");
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

function get_schedules(course_ids, accepted_statuses) {
  const courses = models.courses.filter(course => course_ids.includes(course.id));
  const pg = new course_scheduler.PeriodGroup(
    courses.map(course => api.course_object_to_period_group(course, true, accepted_statuses)),
    'and'
  );
  const ev = pg.evaluate();
  return ev;
}
