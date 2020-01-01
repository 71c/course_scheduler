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

var calendarEl;
var calendar;
const dayToDate = {
    Su: '2012-04-01',
    Mo: '2012-04-02',
    Tu: '2012-04-03',
    We: '2012-04-04',
    Th: '2012-04-05',
    Fr: '2012-04-06',
    Sa: '2012-04-07',
};
// const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink"]
const colors = ["red", "blue", "orange", "purple", "yellow", "pink", "green"];

var scheduleIndex = 0;
var leftButton, rightButton;

const {n_possibilities, top_schedules, courses} = data;
const sections_by_id = {};
const section_indices_by_id = {};
for (const course of courses) {
    for (const section of course.sections) {
        sections_by_id[section.id] = section;
        section_indices_by_id[section.id] = 0;
    }
}

var sectionSelectDiv;

function minutesToTimeString(minutes) {
    var minutePart = minutes % 60;
    var hourPart = Math.floor(minutes / 60);
    var hourPartString = hourPart > 9 ? hourPart.toString() : "0" + hourPart.toString();
    var minutePartString = minutePart > 9 ? minutePart.toString() : "0" + minutePart.toString();
    return hourPartString + ":" + minutePartString;
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

function newCalendar(element, events) {
    if (events === undefined)
        events = [];
    return new FullCalendar.Calendar(element, {
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
                        setSchedule();
                        updateButtonsEnabled();
                        makeSectionSelects();
                    }
                }
            },
            right: {
                icon: 'chevron-right',
                click: function() {
                    if (scheduleIndex !== top_schedules.length - 1) {
                        scheduleIndex++;
                        setSchedule();
                        updateButtonsEnabled();
                        makeSectionSelects();
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
        events: events,
        eventRender: function(info) {
            $(info.el).attr({
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'data-html': true,
                'title': `${info.event.extendedProps.course_title}<br>${info.event.extendedProps.timeString}`
            });
        },
        minTime: "07:00",
        maxTime: "22:00",
        displayEventTime: false
    });
}

function makeSectionSelects() {
    while (sectionSelectDiv.firstChild)
        sectionSelectDiv.removeChild(sectionSelectDiv.firstChild);
    var schedule = top_schedules[scheduleIndex].schedule;
    for (let i = 0; i < schedule.length; i++) {
        const current_course = courses[i];
        for (const section_id of schedule[i]) {
            const section = sections_by_id[section_id];
            const labelText = `${current_course.course_num} ${section.component}: `;

            const row = document.createElement("tr");
            
            const desc = document.createElement("td");
            desc.innerHTML = labelText;
            row.appendChild(desc);

            const val = document.createElement("td");
            row.appendChild(val);
            
            if (section.sections.length > 1) {
                const select = document.createElement("select");
                for (let i = 0; i < section.sections.length; i++) {
                    const option = document.createElement("option");
                    option.innerHTML = section.sections[i].section_num;
                    option.value = i;
                    select.appendChild(option);
                }
                val.appendChild(select);

                select.onchange = function() {
                    section_indices_by_id[section.id] = parseInt(this.value, 10);
                    setSchedule();
                };
            } else {
                const text = document.createElement("span");
                text.innerHTML = section.sections[0].section_num;
                val.appendChild(text);
            }

            sectionSelectDiv.appendChild(row);
        }
    }
}

function setSchedule() {
    var schedule = top_schedules[scheduleIndex].schedule;
    
    calendar.batchRendering(function() {
        for (const event of calendar.getEvents())
            event.remove();
        for (let i = 0; i < schedule.length; i++) {
            const current_course = courses[i];
            for (const section_id of schedule[i]) {
                const section = sections_by_id[section_id];
                const subsection = section.sections[section_indices_by_id[section_id]];
                for (const period of section.periods) {
                    const date = dayToDate[period.day];
                    const startString = minutesToTimeString(period.start);
                    const endString = minutesToTimeString(period.end);
                    calendar.addEvent({
                        title: `${current_course.course_num}-${subsection.section_num}`,
                        course_title: current_course.title,
                        start: `${date}T${startString}`,
                        end: `${date}T${endString}`,
                        color: colors[i],
                        timeString: `${minutesToTimeString12hr(period.start)} - ${minutesToTimeString12hr(period.end)}`,
                    });
                }
            }
        }
    });
    $('[data-toggle="tooltip"]').tooltip();
    document.getElementById("score").innerHTML = `Score: ${Math.round(top_schedules[scheduleIndex].score * 100) / 100}`;
}

function updateButtonsEnabled() {
    leftButton.disabled = scheduleIndex === 0;
    rightButton.disabled = scheduleIndex === top_schedules.length - 1;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('heading').innerHTML = `${n_possibilities} Schedule${n_possibilities===1?"":"s"} Generated`;
    if (n_possibilities !== 0) {
        calendarEl = document.getElementById('calendar');
        calendar = newCalendar(calendarEl, []);
        calendar.render();
        setSchedule();
        leftButton = document.querySelector('.fc-left-button');
        rightButton = document.querySelector('.fc-right-button');
        updateButtonsEnabled();
        sectionSelectDiv = document.getElementById('section-select');
        makeSectionSelects();
    }
});
