"use strict";
let my_courses_ids = new Set();
const classes_by_id = {};
let minMaxTimes = [450, 1290];
let resultsDiv;

function update_courses_display() {
    const courses_container = document.getElementById("my_courses");
    while (courses_container.firstChild)
        courses_container.removeChild(courses_container.firstChild);
    for (const course_id of my_courses_ids.values()) {
        const course = classes_by_id[course_id];
        const course_element = document.createElement('div');
        course_element.innerHTML = `${course.course_num} - ${course.title}`;
        courses_container.appendChild(course_element);
    }
}

function clearSearchResults() {
    while (resultsDiv.firstChild)
        resultsDiv.removeChild(resultsDiv.firstChild);
}

var renderSearchResults = function(res, clearResultsIfNoResults) {
    if (res.length === 0 && !clearResultsIfNoResults)
        return;
    clearSearchResults();
    resultsDiv.innerHTML = res.map(
        // The onmousedown="event.preventDefault()" part prevents the buttons from staying focused https://stackoverflow.com/a/45851915
        function(course) {
return`<div class="card">
    <div class="card-header d-flex py-0" role="tab" id="header${course.id}">
    <a data-toggle="collapse" class="flex-grow-1 py-2" data-target="#collapser${course.id}" aria-controls="collapser${course.id}" aria-expanded="false">${course.course_num} - ${course.title}</a>
    <button onmousedown="event.preventDefault()" id="button${course.id}" class="btn btn-primary my-2" type="button" kind="add">Add</button>
    </div>
    <div class="collapse" aria-labelledby="header${course.id}" id="collapser${course.id}">
    <div class="card-body">
        <!-- <h5 class="card-title">${course.title}</h5> -->
        <p class="card-text">${course.desc_long?course.desc_long:"[No course description]"}</p>
    </div>
    </div>
    </div>`}).join('');

    res.forEach(function(course) {
        const course_result = document.getElementById('button'+course.id);
        if (my_courses_ids.has(course.id)) {
            course_result.setAttribute("kind", "remove");
            course_result.innerHTML = "Remove";
        }
        classes_by_id[course.id] = course;
        course_result.addEventListener('click', function() {
            if (this.getAttribute("kind") === "add") {
                my_courses_ids.add(course.id);
                this.setAttribute("kind", "remove");
                this.innerHTML = "Remove";
            } else {
                my_courses_ids.delete(course.id);
                this.setAttribute("kind", "add");
                this.innerHTML = "Add";
            }
            update_courses_display();
        });
    });
}

var getSearchResults = function(clearResultsIfNoResults) {
    var searchTerm = document.getElementById('search_bar').value;
    if (searchTerm.length === 0)
        return;
    $.ajax({
        url: `/search?query=${searchTerm}&term=${document.querySelector(".custom-select").value}`
    }).done(function(res) {
        renderSearchResults(res, clearResultsIfNoResults);
    }).fail(function(err) {
      console.log('Error: ' + err.status);
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

document.addEventListener('DOMContentLoaded', function() {

    $("#time_range_slider").slider({
        range: true,
        min: minMaxTimes[0],
        max: minMaxTimes[1],
        step: 15,
        values: minMaxTimes,
        slide: function(event, ui) {
            $("#time_range").text(minutesToTimeString12hr(ui.values[0]) + " - " + minutesToTimeString12hr(ui.values[1]))
            minMaxTimes = ui.values;
        }
    })
    $("#time_range").text(minutesToTimeString12hr($("#time_range_slider").slider("values", 0)) + " - " + minutesToTimeString12hr($("#time_range_slider").slider("values", 1)));

    for (const id of ["#mornings-slider", "#nights-slider", "#consecutive-classes-slider"]) {
        const jSlider = $(id);
        jSlider.slider({
            min: -100,
            max: 100,
            value: 0,
            slide: function(event, ui) {
                // https://stackoverflow.com/a/4808375/9911203
                if (ui.value > -10 && ui.value < 10 && ui.value != 0) {
                    jSlider.slider('value', 0);
                    return false;
                }
                return true;
            }
        });
    }

    resultsDiv = document.getElementById('results');
    // document.querySelector('#search_form').onsubmit = getSearchResults;
    $("#search_bar").keyup(function() {
        getSearchResults(false);
    });
    $('#term-select').change(function() {
        my_courses_ids = new Set();
        update_courses_display();
        getSearchResults(true);
    });
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
            min_time: minMaxTimes[0],
            max_time: minMaxTimes[1],
            term: document.getElementById('term-select').value,
            pref_morning: $("#mornings-slider").slider("value"),
            pref_night: $("#nights-slider").slider("value"),
            pref_consecutive: $("#consecutive-classes-slider").slider("value")
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