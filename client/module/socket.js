define(['io'], function(io){
    var socket = io.connect();
    socket.on('connect_failed', function(){
        console.log('Socket.io connection failed!');
    });

    return socket;
});
