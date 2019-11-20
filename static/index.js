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
});
