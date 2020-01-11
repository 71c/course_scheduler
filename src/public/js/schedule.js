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
const colors = ["red", "blue", "orange", "purple", "green", "deeppink", "deepskyblue", "darkslategray", "brown"];

var scheduleIndex = 0;
var leftButton, rightButton;

const {n_possibilities, top_schedules, courses, term_code} = data;
const sections_by_id = {};
for (const course of courses) {
    for (const section of course.sections) {
        sections_by_id[section.id] = section;
    }
}

var scriptButton;

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
            
            const text = document.createElement("span");
            text.innerHTML = section.section_num;
            val.appendChild(text);

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
// https://stackoverflow.com/a/11381730
// function isMobileOrTablet() {
//   var check = false;
//   (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
//   return check;
// };

(function () {var a={};var g=/iPhone/i,p=/iPod/i,i=/iPad/i,f=/\bAndroid(?:.+)Mobile\b/i,h=/Android/i,d=/(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,e=/Silk/i,c=/Windows Phone/i,j=/\bWindows(?:.+)ARM\b/i,k=/BlackBerry/i,l=/BB10/i,m=/Opera Mini/i,n=/\b(CriOS|Chrome)(?:.+)Mobile/i,o=/Mobile(?:.+)Firefox\b/i;function b($,a){return $.test(a)}function q($){var a=($=$||("undefined"!=typeof navigator?navigator.userAgent:"")).split("[FBAN");void 0!==a[1]&&($=a[0]),void 0!==(a=$.split("Twitter"))[1]&&($=a[0]);var r={apple:{phone:b(g,$)&&!b(c,$),ipod:b(p,$),tablet:!b(g,$)&&b(i,$)&&!b(c,$),device:(b(g,$)||b(p,$)||b(i,$))&&!b(c,$)},amazon:{phone:b(d,$),tablet:!b(d,$)&&b(e,$),device:b(d,$)||b(e,$)},android:{phone:!b(c,$)&&b(d,$)||!b(c,$)&&b(f,$),tablet:!b(c,$)&&!b(d,$)&&!b(f,$)&&(b(e,$)||b(h,$)),device:!b(c,$)&&(b(d,$)||b(e,$)||b(f,$)||b(h,$))||b(/\bokhttp\b/i,$)},windows:{phone:b(c,$),tablet:b(j,$),device:b(c,$)||b(j,$)},other:{blackberry:b(k,$),blackberry10:b(l,$),opera:b(m,$),firefox:b(o,$),chrome:b(n,$),device:b(k,$)||b(l,$)||b(m,$)||b(o,$)||b(n,$)},any:!1,phone:!1,tablet:!1};return r.any=r.apple.device||r.android.device||r.windows.device||r.other.device,r.phone=r.apple.phone||r.android.phone||r.windows.phone,r.tablet=r.apple.tablet||r.android.tablet||r.windows.tablet,r}a=q();if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=a}else if(typeof define==="function"&&define.amd){define(function(){return a})}else{this["isMobile"]=a}})();


document.addEventListener('DOMContentLoaded', function() {
    if (!window.hasUserscript) {
        window.hasUserscript = false;
    }
    if (n_possibilities !== 0) {
        calendarEl = document.getElementById('calendar');
        calendar = newCalendar(calendarEl, []);
        calendar.render();

        sectionSelectDiv = document.getElementById('section-select');

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
            '<br>To add these sections to your cart, you need to get the Tampermonkey extension and install the userscript. <br><br>It looks like you\'re using <b>Opera</b>; it is not as easy as in Chrome and Firefox to get Tampermonkey and the userscript running in Opera but if you want to you can follow these steps: <ol><li>Install the <a href="https://addons.opera.com/en/extensions/details/install-chrome-extensions/" rel="external noreferrer noopener nofollow" target="_blank">Opera Add-on for Installing Chrome Extensions</a><li><b>Install Tampermonkey BETA.</b> It seems that Opera blacklisted Tampermonkey so you can\'t use regular Tampermonkey but you can <a href="https://chrome.google.com/webstore/detail/tampermonkey-beta/gcalenpjmijncebpfijmoaglllgpjagf" target="_blank" rel="external noopener noreferrer nofollow">get Tampermonkey BETA here</a> which does work.<li><b>Get the userscript.</b><ol><li>Go to the Tampermonkey dashboard<li>Go to the Utilities tab<li>type <span class="text-monospace">https://openuserjs.org/install/71c/Tufts_Course_Scheduler_Auto-Sign-Up.user.js</span> into the input next to where it says "Install from URL" and click "install".<li>Click "install".</ol></ol>'
            : isChrome() ?
            'Automatically add these sections to your cart by getting the <a href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo" target="_blank" rel="noopener noreferrer">Tampermonkey</a> extension and installing the ' + userscriptLink + '.'
            : isFirefox() ?
            'Automatically add these sections to your cart by getting the <a href="https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/" target="_blank" rel="noopener noreferrer">Tampermonkey</a> extension and installing the ' + userscriptLink + '.'
            : isSafari() ?
            '<br>Automatically add these sections to your cart by getting the Tampermonkey extension and installing the ' + userscriptLink + '.<br><br> It looks like you\'re using Safari, and I don\'t think you can get Tampermonkey for Safari now: <a href="https://openuserjs.org/about/Tampermonkey-for-Safari" rel="noopener noreferrer nofollow" target="_blank">See here</a><br>You can get Tampermonkey in <b>Chrome</b> and <b>Firefox</b> though. Switch to one of these browsers.'
            : isEdge() ?
            'Automatically add these sections to your cart by getting the <a href="https://www.microsoft.com/store/apps/9NBLGGH5162S" target="_blank" rel="noopener noreferrer nofollow">Tampermonkey</a> extension and installing the ' + userscriptLink + '.'
            : isMobile.any ?
            'To add these sections to your cart, you need to get the Tampermonkey extension and install the ' + userscriptLink + '. This is available on non-mobile devices on Chrome and Firefox.'
            : 'To add these sections to your cart, you need to get the Tampermonkey extension and install the ' + userscriptLink + '. I don\'t know what browser you are using but Tampermonkey is available in Chrome and Firefox.';

            left.appendChild(nouserscript);

            nouserscript.style.display = "none";

            var button = document.createElement('button');
            button.className = "btn btn-primary";
            button.innerText = 'Automatically sign me up on SIS';
            button.onclick = function() {
                nouserscript.style.display = "";
                button.style.display = "none";
            }
            left.appendChild(button);
        }

        document.dispatchEvent(new Event('startUserscript'));
    }
});
