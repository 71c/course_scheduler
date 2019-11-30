function time() {
    return new Date().getTime();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('page loaded');
    let t = 0;
    // const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    const socket = io();

    let myClasses = [];
    document.querySelector('#update_data').onsubmit = function() {
        socket.emit('update data');
        return false;
    };
    document.querySelector('#search_form').onsubmit = function() {
        t = time();
        socket.emit('search', { 'term': document.querySelector('#search_bar').value });
        return false;
    };
    socket.on('updated data', () => {
        console.log('updated data');
    });
    socket.on('results', data => {
        console.log(time() - t);

        const resultsDiv = document.getElementById('results');
        while (resultsDiv.firstChild) {
            resultsDiv.removeChild(resultsDiv.firstChild);
        }
        resultsDiv.innerHTML = data.map(
            course => `<div class="card"><div class="card-header d-flex" role="tab" id="header${course.id}"><a data-toggle="collapse" class="flex-grow-1" data-target="#collapser${course.id}" aria-controls="collapser${course.id}" aria-expanded="false">${course.course_num} - ${course.title}</a><button id="button${course.id}" class="btn btn-primary" type="button" kind="add">Add</button></div><div class="collapse" aria-labelledby="header${course.id}" id="collapser${course.id}"><div class="card-body"><h5 class="card-title">${course.title}</h5><p class="card-text">${course.desc_long}</p></div></div></div>`
            ).join('');
        data.forEach(course => document.getElementById('button'+course.id).onclick = () => myClasses.push(course));
    })
});
