// import '@fullcalendar/core/main.css';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';
// import '@fullcalendar/list/main.css';

// import { Calendar } from '@fullcalendar/core';
// import timeGridPlugin from '@fullcalendar/timegrid';

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    plugins: ['timeGrid'],
    header: null,
    columnFormat: 'dddd',
    allDaySlot: false,
    hiddenDays: [0],
    minTime: '07:00:00',
    maxTime: '21:00:00',
    editatble: true,
  });

  calendar.render();
});
