document.addEventListener('DOMContentLoaded', () => {
    console.log('page loaded');
    let t = 0;
    const socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    let myClasses = [];
    document.querySelector('#update_data').onsubmit = function() {
        socket.emit('update data');
        return false;
    };
    document.querySelector('#search_form').onsubmit = function() {
        var d = new Date();
        t = d.getTime();
        socket.emit('search', { 'term': document.querySelector('#search_bar').value });
        return false;
    };
    socket.on('updated data', () => {
        console.log('updated data');
    });
    socket.on('results', data => {
        var d = new Date();
        console.log(d.getTime() - t);
        console.log(data);
        d = new Date();
        t = d.getTime();
        
        // SLOW
        // const resultsDiv = $('#results');
        // resultsDiv.empty();
        // data.forEach((course) => {
        //     // https://getbootstrap.com/docs/4.3/components/collapse/#accordion-example
        //     // https://mdbootstrap.com/docs/jquery/javascript/accordion/
        //     const cardHeaderLeft = $(`<a data-toggle="collapse" class="flex-grow-1" data-target="#collapser${course.id}" aria-controls="collapser${course.id}">${course.course_num} - ${course.title}</a>`);
        //     const cardHeaderRight = $(`<button id="button${course.id}" class="btn btn-primary" type="button" kind="add">Add</button>`).click(() => {
        //         myClasses.push(course);
        //     });
        //     const cardHeader = $(`<div class="card-header d-flex" role="tab" id="header${course.id}"></div>`).append(cardHeaderLeft).append(cardHeaderRight);

        //     const cardBody = $('<div class="card-body"></div>')
        //         .append($(`<h5 class="card-title">${course.title}</h5>`))
        //         .append($(`<p class="card-text">${course.desc_long}</p>`));

        //     const collapser = $(`<div class="collapse" aria-labelledby="header${course.id}" id="collapser${course.id}"></div>`)
        //         .append(cardBody);
            
        //     const card = $('<div class="card"></div>').append(cardHeader).append(collapser);
            
        //     resultsDiv.append(card);
        // });

        // FASTER
        // const resultsDiv = document.getElementById('results');
        // while (resultsDiv.firstChild) {
        //     resultsDiv.removeChild(resultsDiv.firstChild);
        // }
        // data.forEach((course) => {
        //     // https://getbootstrap.com/docs/4.3/components/collapse/#accordion-example
        //     // https://mdbootstrap.com/docs/jquery/javascript/accordion/
        //     const cardHeaderLeft = document.createElement('a');
        //     cardHeaderLeft.setAttribute('data-toggle', 'collapse');
        //     cardHeaderLeft.className = 'flex-grow-1';
        //     cardHeaderLeft.setAttribute('data-target', `#collapser${course.id}`);
        //     cardHeaderLeft.setAttribute('aria-controls', `collapser${course.id}`);
        //     cardHeaderLeft.innerHTML = `${course.course_num} - ${course.title}`;

        //     const cardHeaderRight = document.createElement('button');
        //     cardHeaderRight.id = `button${course.id}`;
        //     cardHeaderRight.className = 'btn btn-primary';
        //     cardHeaderRight.type = 'button';
        //     cardHeaderRight.kind = 'add';
        //     cardHeaderRight.innerHTML = 'Add';
        //     cardHeaderRight.onclick = () => {
        //         myClasses.push(course);
        //     };
        //     const cardHeader = document.createElement('div');
        //     cardHeader.className = 'card-header d-flex';
        //     cardHeader.id = `header${course.id}`;
        //     cardHeader.appendChild(cardHeaderLeft);
        //     cardHeader.appendChild(cardHeaderRight);

        //     const heading = document.createElement('h5');
        //     heading.className = 'card-title';
        //     heading.innerHTML = course.title;
        //     const p = document.createElement('p');
        //     p.className = 'card-text';
        //     p.innerHTML = course.desc_long;
        //     const cardBody = document.createElement('div');
        //     cardBody.className = 'card-body';
        //     cardBody.appendChild(heading);
        //     cardBody.appendChild(p);

        //     const collapser = document.createElement('div');
        //     collapser.className = 'collapse';
        //     collapser.setAttribute('aria-labelledby', `header${course.id}`);
        //     collapser.id = `collapser${course.id}`;
        //     collapser.appendChild(cardBody);

        //     const card = document.createElement('div');
        //     card.appendChild(cardHeader);
        //     card.appendChild(collapser);
            
        //     resultsDiv.appendChild(card);
        // });

        // FASTEST
        // const resultsDiv = document.getElementById('results');
        // while (resultsDiv.firstChild) {
        //     resultsDiv.removeChild(resultsDiv.firstChild);
        // }
        // resultsDiv.innerHTML = data.map(course => {
        //     // https://getbootstrap.com/docs/4.3/components/collapse/#accordion-example
        //     // https://mdbootstrap.com/docs/jquery/javascript/accordion/
        //     const cardHeaderLeftText = `<a data-toggle="collapse" class="flex-grow-1" data-target="#collapser${course.id}" aria-controls="collapser${course.id}">${course.course_num} - ${course.title}</a>`;
        //     const cardHeaderRightText = `<button id="button${course.id}" class="btn btn-primary" type="button" kind="add">Add</button>`;
        //     const cardHeaderText = `<div class="card-header d-flex" id="header${course.id}">${cardHeaderLeftText}${cardHeaderRightText}</div>`;
        //     const cardBodyText = `<div class="card-body"><h5 class="card-title">${course.title}</h5><p class="card-text">${course.desc_long}</p></div>`;
        //     const collapserText = `<div class="collapse" aria-labelledby="header${course.id}" id="collapser${course.id}">${cardBodyText}</div>`;
        //     return `<div class="card">${cardHeaderText}${collapserText}</div>`;
        // }).join('');
        // data.forEach(course => document.getElementById('button'+course.id).onclick = () => myClasses.push(course));

        // FASTEST AND SHORTEST
        const resultsDiv = document.getElementById('results');
        while (resultsDiv.firstChild) {
            resultsDiv.removeChild(resultsDiv.firstChild);
        }
        resultsDiv.innerHTML = data.map(
            course => `<div class="card"><div class="card-header d-flex" id="header${course.id}"><a data-toggle="collapse" class="flex-grow-1" data-target="#collapser${course.id}" aria-controls="collapser${course.id}">${course.course_num} - ${course.title}</a><button id="button${course.id}" class="btn btn-primary" type="button" kind="add">Add</button></div><div class="collapse" aria-labelledby="header${course.id}" id="collapser${course.id}"><div class="card-body"><h5 class="card-title">${course.title}</h5><p class="card-text">${course.desc_long}</p></div></div></div>`
            ).join('');
        data.forEach(course => document.getElementById('button'+course.id).onclick = () => myClasses.push(course));

        var d = new Date();
        console.log(d.getTime() - t);
    })
});
