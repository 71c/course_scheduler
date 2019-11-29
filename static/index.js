var socket;
document.addEventListener('DOMContentLoaded', () => {
    console.log('page loaded');
    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    document.querySelector('#update_data').onsubmit = function() {
        socket.emit('update data');
        return false;
    };
    document.querySelector('#search_form').onsubmit = function() {
        socket.emit('search', { 'term': document.querySelector('#search_bar').value });
        return false;
    };
    socket.on('updated data', () => {
        console.log('updated data');
    });
    socket.on('results', data => {
        console.log(data);
        resultsDiv = $('#results');
        resultsDiv.empty();
        data.forEach((course) => {
            // https://getbootstrap.com/docs/4.3/components/collapse/#accordion-example


            // (a)
            // const buttonInCardHeader = $('<button class="btn btn-link" type="button" data-toggle="collapse">')
            //     .attr({
            //         "data-target": `#collapser${course.id}`,
            //         "aria-controls": `collapser${course.id}`
            //     }).text(course.course_num + ' - ' + course.title);

            // const cardHeader = $('<div class="card-header">')
            //     .attr("id", `header${course.id}`)
            //     .append(buttonInCardHeader);


            // (b)
            // const cardHeader = $('<div class="card-header" data-toggle="collapse">')
            //     .attr({
            //         "data-target": `#collapser${course.id}`,
            //         "aria-controls": `collapser${course.id}`,
            //         "id": `header${course.id}`
            //     }).text(course.course_num + ' - ' + course.title);


            // (c)
            // const cardHeader = $('<div class="card-header" data-toggle="collapse">')
            // const cardHeader = $('<div class="card-header btn-toolbar justify-content-between" data-toggle="collapse">')
            //     .attr({
            //         "data-target": `#collapser${course.id}`,
            //         "aria-controls": `collapser${course.id}`,
            //         "id": `header${course.id}`
            //     }).append($(`<span>${course.course_num} - ${course.title}</span>`))
            //     .append($('<button id="button" class="btn btn-primary" type="button">Add</button>'));


            // (d)
            // const cardHeader = $('<div class="card-header row">')
            //     .append(
            //         $(`<span class="col-sm" data-toggle="collapse">${course.course_num} - ${course.title}</span>`)
            //             .attr({
            //                 "data-target": `#collapser${course.id}`,
            //                 "aria-controls": `collapser${course.id}`,
            //                 "id": `header${course.id}`
            //             })
            //     )
            //     .append(
            //         // $('<div class="col-sm"></div>')
            //         //     .append(
            //         //         $('<button id="button" class="btn btn-primary" type="button">Add</button>')
            //         //     )
            //         $('<div class="col-sm"></div>')
            //             .append(
            //                 $('<div class="row justify-content-end btn-toolbar"></div>')
            //                     .append(
            //                         $('<button id="button" class="btn btn-primary" type="button">Add</button>')
            //                     )
            //             )
            //     );

            // (e)
            // const cardHeader = $('<div class="row">')
            //     .append(
            //         $(`<span class="col-md card-header" data-toggle="collapse">${course.course_num} - ${course.title}</span>`)
            //             .attr({
            //                 "data-target": `#collapser${course.id}`,
            //                 "aria-controls": `collapser${course.id}`,
            //                 "id": `header${course.id}`
            //             })
            //     )
            //     .append(
            //         $('<div class="col-md"></div>')
            //             .append(
            //                 $('<div class="row justify-content-end btn-toolbar card-header"></div>')
            //                     .append(
            //                         $('<button id="button" class="btn btn-primary" type="button">Add</button>')
            //                     )
            //             )
            //     );

            // (f)
            // const buttonInCardHeader = $('<div data-toggle="collapse">')
            //     .attr({
            //         "data-target": `#collapser${course.id}`,
            //         "aria-controls": `collapser${course.id}`
            //     }).text(course.course_num + ' - ' + course.title);

            // const cardHeader = $('<div class="card-header">')
            //     .attr("id", `header${course.id}`)
            //     .append(buttonInCardHeader);



            // // (g)
            // const buttonInCardHeader = $('<div data-toggle="collapse" class="float-left">')
            //     .attr({
            //         "data-target": `#collapser${course.id}`,
            //         "aria-controls": `collapser${course.id}`
            //     }).text(course.course_num + ' - ' + course.title);
            // const cardHeader = $('<div class="card-header">')
            //     .attr("id", `header${course.id}`)
            //     .append(buttonInCardHeader)
            //     .append($('<button id="button" class="btn btn-primary float-right" type="button">Add</button>'));


            // (h)
            const buttonInCardHeader = $('<div class="float-left">')
                .text(course.course_num + ' - ' + course.title);
            const cardHeaderLeft = $('<div data-toggle="collapse" class="col">')
                .attr({
                    "data-target": `#collapser${course.id}`,
                    "aria-controls": `collapser${course.id}`,
                    "id": `header${course.id}`
                })
                .append(buttonInCardHeader);
            const cardHeaderRight = $('<button id="button" class="btn btn-primary float-right" type="button">Add</button>');
            const cardHeader = $('<div class="card-header row"></div>').append(cardHeaderLeft).append(cardHeaderRight);



                

            

            const cardBody = $('<div class="card-body"></div>')
                .append(
                    $(`<h5 class="card-title">${course.title}</h5>`)
                )
                .append(
                    $(`<p class="card-text">${course.desc_long}</p>`)
                );

            const collapser = $('<div class="collapse"></div>')
                .attr({
                    "aria-labelledby": `header${course.id}`,
                    "id": `collapser${course.id}`
                }).append(cardBody);
            
            const card = $('<div class="card"></div>').append(cardHeader).append(collapser);
            
            resultsDiv.append(card);
        });
    })
});
