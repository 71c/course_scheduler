var socket;
document.addEventListener('DOMContentLoaded', () => {

    socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {
        // socket.emit('my event', {data: 'I\'m connected!'});
        document.querySelector('#update_data').onsubmit = function() {
            socket.emit('update data');
            console.log("HELLO")
            return false;
        }
    });
});