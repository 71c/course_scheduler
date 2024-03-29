"use strict";



// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
async function postData(url = '', data = {}) {
// Default options are marked with *
const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
    'Content-Type': 'application/json'
    // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
});
return response.json(); // parses JSON response into native JavaScript objects
}



/* ------------ Helper functions -------------- */

function getItem(key, defaultValue) {
    const val = localStorage.getItem(key);
    if (val === null) {
        if (defaultValue === undefined) {
            return null;
        }
        else {
            localStorage.setItem(key, defaultValue);
            return localStorage.getItem(key);
        }
    }
    return val;
}

function getItemInt(key, defaultValue) {
    return parseInt(getItem(key, defaultValue), 10);
}

function getItemJSON(key, defaultValue) {
    return JSON.parse(getItem(key, defaultValue));
}

function setItem(key, value) {
    localStorage.setItem(key, value);
}


let currTerm;
function saveTerm() {
    currTerm = document.getElementById('term-select').value;
    setItem("term", currTerm);
}


let my_courses_ids;

function loadCourseIds() {
    let keyName = "courseIds_" + currTerm;
    my_courses_ids = new Set(getItemJSON(keyName, "[]"));
}

function saveCourseIds() {
    const courseIdsList = [...my_courses_ids.values()];
    setItem("courseIds_" + currTerm, JSON.stringify(courseIdsList));
}


let classes_by_id = {};
const minMaxTimes = [450, 1290];
let resultsDiv;
let latestSearchTermWithResults;
let latestSearchTerm;

function update_courses_display() {
    const courses_container = document.getElementById("my_courses");
    while (courses_container.firstChild)
        courses_container.removeChild(courses_container.firstChild);
    for (const course_id of my_courses_ids.values()) {
        const course = classes_by_id[course_id];

        const removeButton = document.createElement('button');
        removeButton.innerText = 'Remove';
        removeButton.className = 'btn btn-primary';
        removeButton.onmousedown = function(event){event.preventDefault()};
        removeButton.onclick = function() {
            const courseResult = document.getElementById('button' + course_id);
            if (courseResult) {
                courseResult.click();
            }
            else {
                my_courses_ids.delete(course_id);
                saveCourseIds();
                update_courses_display();
            }
        };

        const textPart = document.createElement('div');
        textPart.innerText = `${course.course_num} - ${course.title}`;
        textPart.className = 'flex-grow-1';

        const course_element = document.createElement('div');
        course_element.className = 'd-flex py-2';
        course_element.appendChild(textPart);
        course_element.appendChild(removeButton);

        courses_container.appendChild(course_element);
    }
}

var renderSearchResults = function(res, clearResultsIfNoResults) {
    if (res.length === 0 && !clearResultsIfNoResults)
        return;

    let searchTerm = latestSearchTerm;

    // if there are not too many results do it the normal way
    if (res.length <= 500) {
        resultsDiv.innerHTML = res.map(getCourseResultHTML).join('');
        addListeners();
    } else { // otherwise, split it into chunks so it doesn't momentarily lag
        resultsDiv.innerHTML = '';

        let i = 0;
        function add() {
            let n = i + 500;
            while (i < n && i < res.length && searchTerm === latestSearchTerm) {
                resultsDiv.insertAdjacentHTML('beforeend', getCourseResultHTML(res[i]));
                i++;
            }
            if (searchTerm === latestSearchTerm) {
                if (i !== res.length)
                    setTimeout(add, 0);
                else
                    addListeners();
            }
        }
        add();
    }

    function addListeners() {
        res.forEach(function(course) {
            const course_result = document.getElementById('button'+course.id);
            if (my_courses_ids.has(course.id)) {
                course_result.setAttribute("kind", "remove");
                course_result.innerHTML = "Remove";
            }
            classes_by_id[course.id] = course;
            course_result.addEventListener('click', courseResultOnClickFunction(course));
        });
    }
}

function groupBy(items, groupFunction) {
    const map = {};
    for (const item of items) {
        const value = groupFunction(item);
        if (value in map) {
            map[value].push(item);
        } else {
            map[value] = [item];
        }
    }
    return map;
}

function periodsToString(periods) {
    const periodsFormatted = periods.map(period => ({
        day: period.day,
        timeString: minutesToTimeString12hr(period.start) + " - " + minutesToTimeString12hr(period.end)
    }));
    const periodsFormattedByTimeString = groupBy(periodsFormatted, period => period.timeString);
    return Object.keys(periodsFormattedByTimeString).map(timeString =>
            periodsFormattedByTimeString[timeString].map(period => period.day).join(", ")
        + " " + timeString
    ).join("<br>");
}

function getCourseResultHTML(course) {
    const class_attr = course.class_attr;

    function attributesArrToString(attrs) {
        if (attrs.length === 0) return "None";
        if (attrs.length === 1 && attrs[0] === "") {
            return "None";
        }
        return attrs.join(", ");
    }
    const class_attr_text = class_attr instanceof Array ?
            `<span class="font-weight-bold">Attributes:</span> ${attributesArrToString(class_attr)}` :
            `<span class="font-weight-bold">Attributes:</span> <span class="font-weight-bold">Union:</span> ${attributesArrToString(class_attr.union)}, <span class="font-weight-bold">Intersection:</span> ${attributesArrToString(class_attr.intersection)}`

    let card_body = `<p class="card-text">${course.desc_long?course.desc_long:"[No course description]"}</p>
                       <p class="card-text"> ${class_attr_text}</p>`;
    
    const sections_by_component = groupBy(course.sections, section => section.component_short);

    for (const key of Object.keys(sections_by_component)) {
        const sections = sections_by_component[key];
        card_body += `<p class="font-weight-bold">${sections[0].component}</p>`;
        card_body +=
        `<table class="table">
            <thead>
                <tr>
                    <td scope="col">Section</td>
                    <td scope="col">Class No.</td>
                    <td scope="col">Day, Times and Locations</td>
                    <td scope="col">Faculty</td>
                    <td scope="col">Credit</td>
                    <td scope="col">Status</td>
                </tr>
            </thead>
            <tbody>`;
        
        for (const section of sections) {
            card_body +=
            `<tr>
                <td>${section.section_num}</td>
                <td>${section.class_num}</td>
                <td>${periodsToString(section.periods)}</td>
                <td>${section.instructors.join(", ")}</td>
                <td>${section.SHUs}</td>
                <td>
                ${
                    section.status === "O" ? `<img src="/TFP_CLS_SRCH_KEY_OPEN_IMG_1.png" alt="open status image" title="open">` :
                    section.status === "C" ? `<img src="/TFP_CLS_SRCH_KEY_CLOSED_IMG_1.png" alt="closed status image" title="closed">` :
                    section.status === "W" ? `<img src="/TFP_CLS_SRCH_KEY_WAITLIST_IMG_1.png" alt="waitlist status image" title="waitlist">` :
                    section.status
                }
                </td>
            </tr>`;
        }
        card_body += `</tbody></table>`

    
    }

    // The onmousedown="event.preventDefault()" part prevents the buttons from staying focused https://stackoverflow.com/a/45851915
    return`<div class="card">
    <div class="card-header d-flex py-0" role="tab" id="header${course.id}">
    <a data-toggle="collapse" class="flex-grow-1 py-2" data-target="#collapser${course.id}" aria-controls="collapser${course.id}" aria-expanded="false">${course.course_num} - ${course.title}</a>
    <button onmousedown="event.preventDefault()" id="button${course.id}" class="btn btn-primary my-2" type="button" kind="add">Add</button>
    </div>
    <div class="collapse" aria-labelledby="header${course.id}" id="collapser${course.id}">
    <div class="card-body">
        ${card_body}
    </div>
    </div>
    </div>`;
}

function courseResultOnClickFunction(course) {
    return function() {
        if (this.getAttribute("kind") === "add") {
            my_courses_ids.add(course.id);
            this.setAttribute("kind", "remove");
            this.innerHTML = "Remove";
        } else {
            my_courses_ids.delete(course.id);
            this.setAttribute("kind", "add");
            this.innerHTML = "Add";
        }
        saveCourseIds();
        update_courses_display();
    }
}

function getSearchBoxContents() {
    return document.getElementById('search_bar').value.trim();
}

var getSearchResults = function(clearResultsIfNoResults, refresh) {
    var searchTerm = getSearchBoxContents();
    if (searchTerm === "") {
        return;
    }
    if (!refresh && (searchTerm === latestSearchTerm || searchTerm.length === 0))
        return;
    latestSearchTerm = searchTerm;
    if (!refresh && searchTerm === latestSearchTermWithResults)
        return;
    $.ajax({
        url: `/search?query=${searchTerm}&term=${document.getElementById('term-select').value}`
    }).done(function(res) {
        // Only render if the contents of the search bar is the search term.
        // There is a delay so sometimes the results of something that was typed
        // earlier gets sent back later. This fixes that.
        if (getSearchBoxContents() === searchTerm) {
            if (res.length !== 0)
                latestSearchTermWithResults = searchTerm;
            renderSearchResults(res, clearResultsIfNoResults);
        }
    }).fail(function(err) {
      console.error('Error: ' + err.status);
    });

    return false;
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

// https://github.com/kaimallea/isMobile
(function () {var f=/iPhone/i,j=/iPod/i,p=/iPad/i,g=/\bAndroid(?:.+)Mobile\b/i,i=/Android/i,d=/\bAndroid(?:.+)SD4930UR\b/i,e=/\bAndroid(?:.+)(?:KF[A-Z]{2,4})\b/i,c=/Windows Phone/i,h=/\bWindows(?:.+)ARM\b/i,k=/BlackBerry/i,l=/BB10/i,m=/Opera Mini/i,n=/\b(CriOS|Chrome)(?:.+)Mobile/i,o=/Mobile(?:.+)Firefox\b/i;function b($,a){return $.test(a)}function a($){var a=($=$||("undefined"!=typeof navigator?navigator.userAgent:"")).split("[FBAN");void 0!==a[1]&&($=a[0]),void 0!==(a=$.split("Twitter"))[1]&&($=a[0]);var r={apple:{phone:b(f,$)&&!b(c,$),ipod:b(j,$),tablet:!b(f,$)&&b(p,$)&&!b(c,$),device:(b(f,$)||b(j,$)||b(p,$))&&!b(c,$)},amazon:{phone:b(d,$),tablet:!b(d,$)&&b(e,$),device:b(d,$)||b(e,$)},android:{phone:!b(c,$)&&b(d,$)||!b(c,$)&&b(g,$),tablet:!b(c,$)&&!b(d,$)&&!b(g,$)&&(b(e,$)||b(i,$)),device:!b(c,$)&&(b(d,$)||b(e,$)||b(g,$)||b(i,$))||b(/\bokhttp\b/i,$)},windows:{phone:b(c,$),tablet:b(h,$),device:b(c,$)||b(h,$)},other:{blackberry:b(k,$),blackberry10:b(l,$),opera:b(m,$),firefox:b(o,$),chrome:b(n,$),device:b(k,$)||b(l,$)||b(m,$)||b(o,$)||b(n,$)},any:!1,phone:!1,tablet:!1};return r.any=r.apple.device||r.android.device||r.windows.device||r.other.device,r.phone=r.apple.phone||r.android.phone||r.windows.phone,r.tablet=r.apple.tablet||r.android.tablet||r.windows.tablet,r}window.isMobile=a();})();

$.ajax({
    url: `/tell-if-mobile?ismobile=${isMobile.any}`
})

document.addEventListener('DOMContentLoaded', function() {
    // set up time range slider
    $("#time_range_slider").slider({
        range: true,
        min: minMaxTimes[0],
        max: minMaxTimes[1],
        step: 15,
        values: [getItemInt("min_time", minMaxTimes[0]), getItemInt("max_time", minMaxTimes[1])],
        slide: function(event, ui) {
            $("#time_range").text(minutesToTimeString12hr(ui.values[0]) + " - " + minutesToTimeString12hr(ui.values[1]));
            setItem("min_time", ui.values[0]);
            setItem("max_time", ui.values[1]);
        }
    });
    $("#time_range").text(minutesToTimeString12hr($("#time_range_slider").slider("values", 0)) + " - " + minutesToTimeString12hr($("#time_range_slider").slider("values", 1)));

    // set up raking preferences sliders
    for (const [pref_name, id] of [
        ["pref_morning", "#mornings-slider"],
        ["pref_night", "#nights-slider"],
        ["pref_consecutive", "#consecutive-classes-slider"]
    ]) {
        const jSlider = $(id);
        jSlider.slider({
            min: -100,
            max: 100,
            value: getItemInt(pref_name, "0"),
            slide: function(event, ui) {
                // https://stackoverflow.com/a/4808375/9911203
                if (ui.value > -10 && ui.value < 10 && ui.value != 0) {
                    jSlider.slider('value', 0);
                    setItem(pref_name, 0);
                    return false;
                }
                setItem(pref_name, ui.value);
                return true;
            }
        });
    }

    const defaultChecked = {
        O: true,
        C: false,
        W: false
    };

    for (const status of ['O', 'C', 'W']) {
        const checkbox = document.getElementById(status);
        checkbox.onclick = function() {
            setItem(status, this.checked);
        };
        checkbox.checked = getItemJSON(status, defaultChecked[status]);
    }


    resultsDiv = document.getElementById('results');
    $("#search_bar").on('input', function() {
        getSearchResults(true, false);
    });

    function updateCoursesCart() {
        loadCourseIds();
        postData("/get_courses_info_from_ids", {
            ids: JSON.stringify([...my_courses_ids.values()]),
            term: currTerm
        }).then(data => {
            for (const course of data) {
                classes_by_id[course.id] = course;
            }
            update_courses_display();
        });
    }

    $('#term-select').change(function() {
        my_courses_ids = new Set();
        getSearchResults(true, true);
        console.log(document.getElementById('term-select').value);
        saveTerm();
        updateCoursesCart();
    });
    
    if (getItem("term") === null) {
        saveTerm();
    } else {
        currTerm = getItem("term");
        document.querySelector("[value='" + currTerm + "']").selected = true;
    }

    updateCoursesCart();
    

    var scheduleForm = document.getElementById('create schedule');
    scheduleForm.onsubmit = function() {
        if (my_courses_ids.size === 0) {
            alert("No schedules selected!");
            return false;
        }
        // remove the hidden inputs that were added when submitting before;
        // they would still be there if the create schedule button was new-tab-clicked.
        while (scheduleForm.children.length > 1) {
            scheduleForm.removeChild(scheduleForm.lastChild);
        }

        var accepted_statuses = [];
        for (var status of ['O', 'C', 'W'])
            if (document.getElementById(status).checked)
                accepted_statuses.push(status);

        var params = {
            ids: Array.from(my_courses_ids).join("-"),
            accepted_statuses: accepted_statuses.join(""),
            min_time: getItemInt("min_time", minMaxTimes[0]),
            max_time: getItemInt("max_time", minMaxTimes[1]),
            term: document.getElementById('term-select').value,
            pref_morning: getItemInt("pref_morning", 0),
            pref_night: getItemInt("pref_night", 0),
            pref_consecutive: getItemInt("pref_consecutive", 0)
        };
        for (var name in params) {
            let input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = params[name];
            scheduleForm.appendChild(input);
        }
        return true;
    }
});

document.documentElement.style.display = 'block';

// this prevents Safari (as well as Firefox at least on Mac) from caching the page when we go back from schedules page
// https://stackoverflow.com/a/13123626/9911203
$(window).bind("pageshow", function(event) {
    if (event.originalEvent.persisted) {
        window.location.reload()
    }
});
