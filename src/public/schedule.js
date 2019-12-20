// I know have a variable called data which is a json object that has all the info needed to make the schedule.
// TODO: do that

var calendar;
const dayToDate = {
    Su: '2012-04-01',
    Mo: '2012-04-02',
    Tu: '2012-04-03',
    We: '2012-04-04',
    Th: '2012-04-05',
    Fr: '2012-04-06',
    Sa: '2012-04-07',
}
// const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink"]
const colors = ["red", "blue", "orange", "purple", "yellow", "pink", "green"];

var scheduleIndex = 0;
var leftButton, rightButton;

const {n_possibilities, top_schedules, courses} = data;
const sections_by_id = {};
    for (const course of courses)
        for (const section of course.sections)
            sections_by_id[section.id] = section;


function removeAllEvents() {
    for (var event of calendar.getEvents())
        event.remove();
}

function minutesToTimeString(minutes) {
    var minutePart = minutes % 60;
    var hourPart = (minutes - minutePart) / 60;
    var hourPartString = hourPart > 9 ? hourPart.toString() : "0" + hourPart.toString();
    var minutePartString = minutePart > 9 ? minutePart.toString() : "0" + minutePart.toString();
    return hourPartString + ":" + minutePartString;
}

// https://fullcalendar.io/docs/event-parsing
function setSchedule() {
    removeAllEvents();
    var schedule = top_schedules[scheduleIndex].schedule;
    for (let i = 0; i < schedule.length; i++) {
        const current_course = courses[i];
        for (const section_id of schedule[i]) {
            const section = sections_by_id[section_id];
            for (const period of section.periods) {
                const date = dayToDate[period.day];
                const startString = minutesToTimeString(period.start);
                const endString = minutesToTimeString(period.end);
                calendar.addEvent({
                    title: `${current_course.course_num} ${section.section_num}`,
                    start: `${date}T${startString}`,
                    end: `${date}T${endString}`,
                    color: colors[i],
                });
            }
        }
    }
}

function updateButtonsEnabled() {
    if (scheduleIndex === 0)
        leftButton.disabled = true;
    else
        leftButton.disabled = false;
    if (scheduleIndex === n_possibilities - 1)
        rightButton.disabled = true;
    else
        rightButton.disabled = false;
}

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['timeGrid'],
        header: {
            left: 'left,right',
            right: ''
        },
        customButtons: {
            left: {
                icon: 'chevron-left',
                click: function() {
                    if (scheduleIndex !== 0) {
                        scheduleIndex--;
                        updateButtonsEnabled();
                        setSchedule();
                    }
                }
            },
            right: {
                icon: 'chevron-right',
                click: function() {
                    if (scheduleIndex !== n_possibilities - 1) {
                        scheduleIndex++;
                        updateButtonsEnabled();
                        setSchedule();
                    }
                }
            }
        },
        columnHeaderFormat: {
            weekday: 'short'
        },
        weekends: false,
        allDaySlot: false,
        defaultDate: "2012-04-02",
    });
    calendar.render();
    leftButton = document.querySelector('.fc-left-button');
    rightButton = document.querySelector('.fc-right-button');
    updateButtonsEnabled();
    setSchedule();
});
