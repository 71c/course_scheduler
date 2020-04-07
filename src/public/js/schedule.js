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
const colors = ["red", "blue", "orange", "purple", "green", "deeppink", "deepskyblue", "darkslategray", "brown"];

const statusDict = {"O": "Open", "C": "Closed", "W": "Waitlist"};

var scheduleIndex = 0;
var leftButton, rightButton;

const {n_possibilities, top_schedules, courses, term_code} = data;
const sections_by_id = {};
for (const course of courses) {
    for (const section of course.sections) {
        sections_by_id[section.id] = section;
    }
}

var maxWidth = 100;

var sectionSelectDiv;

var rankHolder;
var scoreHolder;

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
                'title': `${info.event.extendedProps.course_title}<br>${info.event.extendedProps.timeString}<br>Instructor: ${info.event.extendedProps.instructor}<br>Status: ${info.event.extendedProps.status}`
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
    const firstRow = document.createElement("tr");
    firstRow.innerHTML = '<th>Section Type</th><th>Section</th><th>Instructor(s)</th>';
    sectionSelectDiv.appendChild(firstRow);
    for (let i = 0; i < schedule.length; i++) {
        const current_course = courses[i];
        for (const section_id of schedule[i]) {
            const section = sections_by_id[section_id];
            const labelText = `${current_course.course_num} ${section.component}: `;

            const row = document.createElement("tr");

            const sectionTypeCell = document.createElement("td");
            sectionTypeCell.innerHTML = labelText;
            row.appendChild(sectionTypeCell);

            const sectionNumCell = document.createElement("td");
            sectionNumCell.innerText = section.section_num;
            row.appendChild(sectionNumCell);

            const instructorCell = document.createElement("td");
            instructorCell.innerText = section.instructors.join(' & ');
            row.appendChild(instructorCell);

            sectionSelectDiv.appendChild(row);
        }
    }
    resizeHeading();
}

function resizeHeading() {
    if (sectionSelectDiv.offsetWidth > maxWidth)
        maxWidth = sectionSelectDiv.offsetWidth + 20;
    document.getElementById('left').style.width = sectionSelectDiv.offsetWidth === 0 ? "" : maxWidth + "px";
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
                for (const period of section.periods) {
                    const date = dayToDate[period.day];
                    const startString = minutesToTimeString(period.start);
                    const endString = minutesToTimeString(period.end);
                    calendar.addEvent({
                        title: `${current_course.course_num}-${section.section_num}`,
                        course_title: current_course.title,
                        start: `${date}T${startString}`,
                        end: `${date}T${endString}`,
                        color: colors[i],
                        timeString: `${minutesToTimeString12hr(period.start)} - ${minutesToTimeString12hr(period.end)}`,
                        instructor: period.instructor,
                        status: statusDict[section.status],
                    });
                }
            }
        }
    });
    $('[data-toggle="tooltip"]').tooltip();
    scoreHolder.innerHTML = `Score: ${Math.round(top_schedules[scheduleIndex].score * 100) / 100}`;
    rankHolder.innerHTML = 'rank: ' + (scheduleIndex+1);
    updateScript();
}

function updateButtonsEnabled() {
    leftButton.disabled = scheduleIndex === 0;
    rightButton.disabled = scheduleIndex === top_schedules.length - 1;
}

function updateScript() {
    document.dispatchEvent(new Event('updateClasses'));
}

// https://stackoverflow.com/a/9851769/9911203
function isFirefox() {
    return typeof InstallTrigger !== 'undefined';
}
function isSafari() {
    return /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
}
function isIE() {
    return /*@cc_on!@*/false || !!document.documentMode;
}
function isEdge() {
    return !isIE() && !!window.StyleMedia;
}
function isChrome() {
    return !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
}
function isOpera() {
    return (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
}
// https://github.com/kaimallea/isMobile
(function () {var a={};var g=/iPhone/i,p=/iPod/i,i=/iPad/i,f=/\bAndroid(?:.+)Mobile\b/i,h=/Android/i,d=/(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,e=/Silk/i,c=/Windows Phone/i,j=/\bWindows(?:.+)ARM\b/i,k=/BlackBerry/i,l=/BB10/i,m=/Opera Mini/i,n=/\b(CriOS|Chrome)(?:.+)Mobile/i,o=/Mobile(?:.+)Firefox\b/i;function b($,a){return $.test(a)}function q($){var a=($=$||("undefined"!=typeof navigator?navigator.userAgent:"")).split("[FBAN");void 0!==a[1]&&($=a[0]),void 0!==(a=$.split("Twitter"))[1]&&($=a[0]);var r={apple:{phone:b(g,$)&&!b(c,$),ipod:b(p,$),tablet:!b(g,$)&&b(i,$)&&!b(c,$),device:(b(g,$)||b(p,$)||b(i,$))&&!b(c,$)},amazon:{phone:b(d,$),tablet:!b(d,$)&&b(e,$),device:b(d,$)||b(e,$)},android:{phone:!b(c,$)&&b(d,$)||!b(c,$)&&b(f,$),tablet:!b(c,$)&&!b(d,$)&&!b(f,$)&&(b(e,$)||b(h,$)),device:!b(c,$)&&(b(d,$)||b(e,$)||b(f,$)||b(h,$))||b(/\bokhttp\b/i,$)},windows:{phone:b(c,$),tablet:b(j,$),device:b(c,$)||b(j,$)},other:{blackberry:b(k,$),blackberry10:b(l,$),opera:b(m,$),firefox:b(o,$),chrome:b(n,$),device:b(k,$)||b(l,$)||b(m,$)||b(o,$)||b(n,$)},any:!1,phone:!1,tablet:!1};return r.any=r.apple.device||r.android.device||r.windows.device||r.other.device,r.phone=r.apple.phone||r.android.phone||r.windows.phone,r.tablet=r.apple.tablet||r.android.tablet||r.windows.tablet,r}a=q();if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=a}else if(typeof define==="function"&&define.amd){define(function(){return a})}else{this["isMobile"]=a}})();

// https://stackoverflow.com/a/38080051/9911203
navigator.browserSpecs = (function(){
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1] || '')};
    }
    if(M[1]=== 'Chrome'){
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem != null) return {name:tem[1].replace('OPR', 'Opera'),version:tem[2]};
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem = ua.match(/version\/(\d+)/i))!= null)
        M.splice(1, 1, tem[1]);
    return {name:M[0], version:M[1]};
})();

document.addEventListener('DOMContentLoaded', function() {
    if (!window.hasUserscript) {
        window.hasUserscript = false;
    }
    if (n_possibilities !== 0) {
        calendarEl = document.getElementById('calendar');
        calendar = newCalendar(calendarEl, []);
        calendar.render();

        sectionSelectDiv = document.getElementById('sections-table');

        scoreHolder = document.createElement('h5');
        scoreHolder.style = "width: 120px;";
        document.querySelector('.fc-right').appendChild(scoreHolder);

        rankHolder = document.createElement('h5');
        rankHolder.innerHTML = 'rank: 1';
        document.querySelector('.fc-center').appendChild(rankHolder);

        setSchedule();
        leftButton = document.querySelector('.fc-left-button');
        rightButton = document.querySelector('.fc-right-button');
        updateButtonsEnabled();
        makeSectionSelects();

        if (!hasUserscript) {
            const left = document.getElementById('left');
            const nouserscript = document.createElement('div');
            nouserscript.style['word-wrap'] = 'break-word';

            var userscriptLink = '<a href="https://openuserjs.org/scripts/71c/Tufts_Course_Scheduler_Auto-Sign-Up" target="_blank" rel="noopener noreferrer">userscript</a>';
            nouserscript.innerHTML = isOpera() ?
`<br>To add these sections to your cart, you need to get the Tampermonkey extension and install the userscript. <br><br>
It looks like you\'re using <b>Opera</b>; it is not as easy as in Chrome and Firefox to get Tampermonkey and the userscript running in Opera but if you want to you can follow these steps:
<ol><li>Install the <a href="https://addons.opera.com/en/extensions/details/install-chrome-extensions/" rel="external noreferrer noopener nofollow" target="_blank">Opera Add-on for Installing Chrome Extensions</a>
<li><b>Install Tampermonkey BETA.</b> It seems that Opera blacklisted Tampermonkey so you can\'t use regular Tampermonkey but you can <a href="https://chrome.google.com/webstore/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf" target="_blank" rel="external noopener noreferrer nofollow">get Tampermonkey BETA here</a> which does work.
<li><b>Get the userscript.</b>
<ol><li>Go to the Tampermonkey dashboard
<li>Go to the Utilities tab
<li>type <span class="text-monospace">https://openuserjs.org/install/71c/Tufts_Course_Scheduler_Auto-Sign-Up.user.js</span> into the input next to where it says "Install from URL" and click "install".
<li>Click "install".</ol></ol>`
            : isChrome() ?
            'Automatically add these sections to your cart by getting the <a href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" target="_blank" rel="noopener noreferrer">Tampermonkey</a> extension and installing the ' + userscriptLink + '.'
            : isFirefox() ?
            'Automatically add these sections to your cart by getting the <a href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/" target="_blank" rel="noopener noreferrer">Tampermonkey</a> extension and installing the ' + userscriptLink + '.'
            : isSafari() ?
`<br>To be able to automatically add these sections to your cart,
<ol>
<li><a href="https://www.tampermonkey.net/?browser=safari" target="_blank" rel="external noopener noreferrer nofollow">Download the Tampermonkey extension${isNaN(parseInt(navigator.browserSpecs.version, 10)) ? '' : navigator.browserSpecs.version < 13 ? ' for Safari 6-12' : ' for Safari 12+'}</a></li>
<li>Install the ${userscriptLink}</li>
</ol>`
            : isEdge() ?
            'Automatically add these sections to your cart by getting the <a href="https://www.microsoft.com/store/apps/9NBLGGH5162S" target="_blank" rel="noopener noreferrer nofollow">Tampermonkey</a> extension and installing the ' + userscriptLink + '.'
            : isMobile.any ?
            'To add these sections to your cart, you need to get the Tampermonkey extension and install the ' + userscriptLink + '. This is available on non-mobile devices on Chrome and Firefox.'
            : 'To add these sections to your cart, you need to get the Tampermonkey extension and install the ' + userscriptLink + '. I don\'t know what browser you are using but Tampermonkey is available in Chrome and Firefox.';

            var b = document.createElement('b')
            b.innerText = 'To automatically sign up on SIS with a script:';
            left.appendChild(b);
            left.appendChild(nouserscript);
        }

        $(window).resize(resizeHeading);

        document.dispatchEvent(new Event('startUserscript'));
    }
});
