import 'bootstrap-material-design/dist/css/bootstrap-material-design.min.css';
import './roboto-css.css';
import './main.css';

require.ensure(['jquery'], function() {
    var {$} = require('jquery');
const my_courses_ids = new Set();
const classes_by_id = {};

function update_courses_display() {
    const courses_container = document.getElementById("my_courses");
    while (courses_container.firstChild) {
        courses_container.removeChild(courses_container.firstChild);
    }
    for (const course_id of my_courses_ids.values()) {
        const course = classes_by_id[course_id];
        const course_element = document.createElement('div');
        course_element.innerHTML = `${course.course_num} - ${course.title}`;
        courses_container.appendChild(course_element);
    }
}

document.addEventListener('DOMContentLoaded', () => {
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
    document.querySelector('#search_form').onsubmit = function() {
        $.ajax({
            url: '/search/' + document.getElementById('search_bar').value
        }).done(function(res) {
            const resultsDiv = document.getElementById('results');
            while (resultsDiv.firstChild) {
                resultsDiv.removeChild(resultsDiv.firstChild);
            }
            resultsDiv.innerHTML = res.map(
                // The onmousedown="event.preventDefault()" part prevents the buttons from staying focused https://stackoverflow.com/a/45851915
                course =>
            `<div class="card">
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
            </div>`).join('');

            res.forEach(course => {
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
        }).fail(function(err) {
          console.log('Error: ' + err.status);
        });
        return false;
    };
    document.getElementById('create schedule').onsubmit = function() {
        var accepted_statuses = [];
        for (var status of ['O', 'C', 'W'])
            if (document.getElementById(status).checked)
                accepted_statuses.push(status);
        $.ajax({
            url: '/get_schedules',
            type: 'GET',
            data: {
                ids: Array.from(my_courses_ids),
                accepted_statuses: accepted_statuses
            },
            contentType: "application/json",
            complete: function(data) {
                console.log(data);
            }
        })
        return false;
    }
});

});

