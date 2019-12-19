// I know have a variable called data which is a json object that has all the info needed to make the schedule.
// TODO: do that

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['timeGrid'],
    header: null,
    columnFormat: 'dddd',
    allDaySlot: false,
    hiddenDays: [0, 6],
    minTime: '07:00:00',
    maxTime: '21:00:00',
    editatble: false,
  });
  calendar.render();
  document.querySelectorAll('.fc-day-header>span').forEach(el => {
    el.innerHTML = el.innerHTML.substring(0, el.innerHTML.indexOf(' '));
  });
});


// events: [
//       {
//         title: 'All Day Event',
//         start: '2019-11-01'
//       },
//       {
//         title: 'Long Event',
//         start: '2019-11-07',
//         end: '2019-11-10'
//       },
//       {
//         groupId: '999',
//         title: 'Repeating Event',
//         start: '2019-11-09T16:00:00'
//       },
//       {
//         groupId: '999',
//         title: 'Repeating Event',
//         start: '2019-11-16T16:00:00'
//       },
//       {
//         title: 'Conference',
//         start: '2019-11-11',
//         end: '2019-11-13'
//       },
//       {
//         title: 'Meeting',
//         start: '2019-11-12T10:30:00',
//         end: '2019-11-12T12:30:00'
//       },
//       {
//         title: 'Lunch',
//         start: '2019-11-12T12:00:00'
//       },
//       {
//         title: 'Meeting',
//         start: '2019-11-12T14:30:00'
//       },
//       {
//         title: 'Birthday Party',
//         start: '2019-11-13T07:00:00'
//       },
//       {
//         title: 'Click for Google',
//         url: 'http://google.com/',
//         start: '2019-11-28'
//       }
//     ]