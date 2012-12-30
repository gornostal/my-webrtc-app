define(['module/socket'], function(socket){

    return {
        join: function(room, success, error){
            socket.emit('join room', {id: room});
            socket.once('join room', function(data){
                if (data.message) {
                    error(data.message);
                } else {
                    success(data.isCaller);
                }
            });
        },
        onLeave: function(callback){
            socket.on('leave room', function(data){
                if (typeof callback === 'function') {
                    callback(data);
                }
            });
        }
    };
});