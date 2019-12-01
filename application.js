const express = require('express');
const app = express();
app.use(express.static('static'));
const http = require('http').createServer(app);
var io = require('socket.io')(http);
const models = require('./models');
const api = require('./api');
const get_data = require('./get_data');
const course_scheduler = require('./course_scheduler');

function time() {
    return new Date().getTime();
}

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
    io.emit('results', search_results_json);

    // const names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015'];
    // const names = ['CHEM-0001', 'SPN-0002', 'COMP-0011', 'FR-0002']
    const names = ['CHEM-0001', 'CHEM-0002', 'SPN-0002', 'SPN-0004']
    
    // time getting results
    let t = time();
    const courses = names.map(x => api.get_search_results(x)[0]);
    console.log(time() - t);
        
    // time turning courses into PeriodGroups
    t = time();
    const pg = new course_scheduler.PeriodGroup(
        courses.map(x => api.course_object_to_period_group(x, true, ['O', 'C', 'W'])),
        'and'
    );
    console.log(time() - t);
    
    // time evaluate
    t = time();
    // const ev = [];
    // for (const x of pg.evaluate())
    //     ev.push(x);
    const ev = pg.evaluate();
    console.log(time() - t);
    
    console.log(ev.length);

  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
