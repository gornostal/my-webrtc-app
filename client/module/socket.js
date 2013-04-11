define(['io'], function(io){
    var socket = io.connect();
    socket.on('connect_failed', function(e){
        console.error('Socket.io connection failed!', e);
    });

    return socket;
});
