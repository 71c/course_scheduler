const my_courses_ids = new Set();
const classes_by_id = {};
let minMaxTimes = [450, 1290];

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

var renderSearchResults = function(res) {
    if (res.length === 0)
        return;
    const resultsDiv = document.getElementById('results');
    while (resultsDiv.firstChild)
        resultsDiv.removeChild(resultsDiv.firstChild);
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

var getSearchResults = function() {
    $.ajax({
        url: '/search/' + document.getElementById('search_bar').value
    }).done(renderSearchResults).fail(function(err) {
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
    console.log('page loaded');
    document.getElementById('update_data').addEventListener('click', function() {
        $.ajax({
          url: '/updatedata',
        }).done(function(res) {
          console.log(res);
        }).fail(function(err) {
          console.log('Error: ' + err.status);
        });
    });
    // document.querySelector('#search_form').onsubmit = getSearchResults;
    $("#search_bar").keyup(getSearchResults);
    var scheduleForm = document.getElementById('create schedule');
    scheduleForm.onsubmit = function() {
        if (my_courses_ids.size === 0) {
            alert("No schedules selected!");
            return false;
        }

        var accepted_statuses = [];
        for (var status of ['O', 'C', 'W'])
            if (document.getElementById(status).checked)
                accepted_statuses.push(status);

        var input1 = document.createElement("input");
        input1.type = "hidden";
        input1.name = "ids";
        input1.value = Array.from(my_courses_ids).join("-");

        var input2 = document.createElement("input");
        input2.type = "hidden";
        input2.name = "accepted_statuses";
        input2.value = accepted_statuses.join("");

        var input3 = document.createElement("input");
        input3.type = "hidden";
        input3.name = "min_time";
        input3.value = minMaxTimes[0];

        var input4 = document.createElement("input");
        input4.type = "hidden";
        input4.name = "max_time";
        input4.value = minMaxTimes[1];

        scheduleForm.appendChild(input1);
        scheduleForm.appendChild(input2);
        scheduleForm.appendChild(input3);
        scheduleForm.appendChild(input4);

        return true;
    }

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
    $("#time_range").text(minutesToTimeString12hr($("#time_range_slider").slider("values", 0)) + " - " + minutesToTimeString12hr($("#time_range_slider").slider("values", 1)))
});

// this prevents Safari (as well as Firefox at least on Mac) from caching 
// https://stackoverflow.com/a/13123626/9911203
$(window).bind("pageshow", function(event) {
    if (event.originalEvent.persisted) {
        window.location.reload() 
    }
});
