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

    // const names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002'];

    // test evaluation with periods... this DOES NOT work
    // const names = ['PHY-0012', 'MATH-0042', 'ENG-0001', 'ES-0002', 'COMP-0015'];
    const names = [ 'MATH-0042'];
    let t = time();
    const courses = names.map(x => api.get_search_results(x)[0]);
    console.log(courses)
    console.log(time() - t);
    t = time();
    console.log(courses);
    const pg = new course_scheduler.PeriodGroup(
        courses.map(x => {
            console.log(x);
            console.log('should be undefined')
            return api.course_object_to_period_group(x, true, ['O'])
        }),
        'and'
    );
    for (let c of pg.contents) {
        console.log(c);
    }
    console.log(time() - t);
    t = time();
    const ev = [];
    for (const x of pg.evaluate())
        ev.push(x);
    console.log(time() - t);
    console.log(ev.length)
    for (const x of ev)
        console.log(x)
    /*
[
  [
    [ [Section], [Section] ],
    [ [Section], [Section] ],
    [ [Section] ],
    [ [Section], [Section] ],
    [ [Section], [Section], [Section] ]
  ],
  [
    [ [Section], [Section] ],
    [ [Section], [Section] ],
    [ [Section] ],
    [ [Section], [Section] ],
    [ [Section], [Section], [Section] ]
  ],
  [
    [ [Section], [Section] ],
    [ [Section], [Section] ],
    [ [Section] ],
    [ [Section], [Section] ],
    [ [Section], [Section], [Section] ]
  ]
]

    */

    // the following seems to WORK!
    // const a = new course_scheduler.PeriodGroup([new models.Section('A','A','A','A','A','A'), new models.Section('B','B','B','B','B','B')], 'or')
    // const b = new course_scheduler.PeriodGroup([new models.Section('C','C','C','C','C','C'), new models.Section('D','D','D','D','D','D')], 'or')
    // const c = new course_scheduler.PeriodGroup([a, b], 'and')
    // for (let x of c.evaluate())
    //     console.log(x)

    // same
    // const section1 = new models.Section('A','A','A','A','A','A');
    // section1.add_period('M', 1, 3);
    // const section2 = new models.Section('B','B','B','B','B','B');
    // section2.add_period('M', 7, 8);
    // const section3 = new models.Section('C','C','C','C','C','C');
    // section3.add_period('M', 2, 4);
    // const section4 = new models.Section('D','D','D','D','D','D');
    // section4.add_period('M', 9, 10);
    // const a = new course_scheduler.PeriodGroup([section1, section2], 'or');
    // const b = new course_scheduler.PeriodGroup([section3, section4], 'or');
    // const pg = new course_scheduler.PeriodGroup([a, b], 'and');

    // const pg = new course_scheduler.PeriodGroup([
    //     new models.Section('A','A','A','A','A','A', [{start: 23, end: 34, day: 'M'}]),
    //     new course_scheduler.PeriodGroup([
    //         new models.Section('B','B','B','B','B','B', [{start: 56, end: 57, day: 'M'}]),
    //         new models.Section('C','C','C','C','C','C', [{start: 6, end: 7, day: 'M'}]),
    //         new models.Section('D','D','D','D','D','D', [{start: 8, end: 9, day: 'M'}])
    //     ], 'or')
    // ], 'and', false);

    // const pg = new course_scheduler.PeriodGroup([
    //     new course_scheduler.PeriodGroup([
    //         new models.Section('A','A','A','A','A','A', [{start: 1, end: 2, day: 'M'}]),
    //         new models.Section('B','B','B','B','B','B', [{start: 4, end: 6, day: 'M'}])
    //     ], 'or'),
    //     new course_scheduler.PeriodGroup([
    //         new models.Section('C','C','C','C','C','C', [{start: 3, end: 4, day: 'M'}]),
    //         new models.Section('D','D','D','D','D','D', [{start: 5, end: 6, day: 'M'}])
    //     ], 'or')
    // ], 'and', false);

    // const pg = new course_scheduler.PeriodGroup([
    //     new course_scheduler.PeriodGroup([
    //         new models.Section('A','A','A','A','A','A', [{start: 11, end: 13, day: 'M'}]),
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('B','A','A','A','A','A', [{start: 13, end: 14, day: 'M'}]),
    //             new models.Section('C','A','A','A','A','A', [{start: 5, end: 12, day: 'M'}]),
    //             new models.Section('D','A','A','A','A','A', [{start: 7, end: 8, day: 'M'}])
    //         ], 'or')
    //     ], 'and', false),
    //     new course_scheduler.PeriodGroup([
    //         new models.Section('E','A','A','A','A','A', [{start: 23, end: 34, day: 'M'}]),
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('F','A','A','A','A','A', [{start: 56, end: 57, day: 'M'}]),
    //             new models.Section('G','A','A','A','A','A', [{start: 6, end: 7, day: 'M'}]),
    //             new models.Section('H','A','A','A','A','A', [{start: 8, end: 9, day: 'M'}])
    //         ], 'or')
    //     ], 'and', false)
    // ], 'or');

    // for (const x of pg.evaluate()) {
    //     for (const y of x) {
    //         console.log(y.class_num, y.periods);
    //     }
    //     console.log('');
    // }



    // const pg = new course_scheduler.PeriodGroup([
    //     new course_scheduler.PeriodGroup([
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('A','A','A','A','A','A', [{start: 1, end: 2, day: 'M'}]),
    //             new models.Section('A','A','A','A','A','A', [{start: 4, end: 6, day: 'M'}])
    //         ], 'or'),
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('A','A','A','A','A','A', [{start: 3, end: 4, day: 'M'}]),
    //             new models.Section('A','A','A','A','A','A', [{start: 5, end: 6, day: 'M'}])
    //         ], 'or')
    //     ], 'and', false),
    //     new course_scheduler.PeriodGroup([
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('A','A','A','A','A','A', [{start: 11, end: 12, day: 'M'}]),
    //             new models.Section('A','A','A','A','A','A', [{start: 0, end: 1, day: 'M'}])
    //         ], 'or'),
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('A','A','A','A','A','A', [{start: 7, end: 8, day: 'M'}]),
    //             new models.Section('A','A','A','A','A','A', [{start: 2, end: 3, day: 'M'}])
    //         ], 'or')
    //     ], 'and', false),
    //     new course_scheduler.PeriodGroup([
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('A','A','A','A','A','A', [{start: 11, end: 12, day: 'M'}]),
    //             new course_scheduler.PeriodGroup([
    //                 new models.Section('A','A','A','A','A','A', [{start: 13, end: 14, day: 'M'}]),
    //                 new models.Section('A','A','A','A','A','A', [{start: 5, end: 6, day: 'M'}]),
    //                 new models.Section('A','A','A','A','A','A', [{start: 7, end: 8, day: 'M'}])
    //             ], 'or')
    //         ], 'and', false),
    //         new course_scheduler.PeriodGroup([
    //             new models.Section('A','A','A','A','A','A', [{start: 23, end: 34, day: 'M'}]),
    //             new course_scheduler.PeriodGroup([
    //                 new models.Section('A','A','A','A','A','A', [{start: 56, end: 57, day: 'M'}]),
    //                 new models.Section('A','A','A','A','A','A', [{start: 6, end: 7, day: 'M'}]),
    //                 new models.Section('A','A','A','A','A','A', [{start: 8, end: 9, day: 'M'}])
    //             ], 'or')
    //         ], 'and', false)
    //     ], 'or')
    // ], 'and', false);
    // let t = time();
    // // const ev = Array.from(pg.evaluate());
    // for (const u of pg.evaluate()) {
        
    // }
    // console.log(time() - t);

    // console.log(ev.length);

    //  for (const x of ev) {
    //     for (const y of x) {
    //         console.log(y.class_num, y.periods);
    //     }
    //     console.log('');
    // }

    

  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
