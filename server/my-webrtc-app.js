#!/usr/bin/env node

/**
 * Usage:
 * node my-webrtc-app.js [port]
 * 
 * Default port is 3000
 */

/*jshint node:true */
/*global console:false */

var connect = require('connect');
var fs = require('fs');

var port = process.argv[2] || 3000;

var app = connect()
    .use(connect.static(__dirname + '/../client'))
    .use(function(req, res){
        if (/room\/.+/.test(req.url)) {
            // serve index.html
            res.end(fs.readFileSync(__dirname + '/../client/index.html'));
        } else {
            // serve 404
            res.writeHead(404);
            res.end(fs.readFileSync(__dirname + '/../client/404.html'));
        }
    })
    .listen(port);

console.log('Server is running at http://localhost:' + port + '/');


var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket) {

    // Returns socket of the other guy
    var getRecipient = function () {
        var rooms = io.sockets.manager.roomClients[socket.id];
        for (var name in rooms){
            if (/^\//.test(name) && rooms[name]) {
                name = name.substr(1);
                var clients = io.sockets.clients(name);
                for (var i in clients) {
                    if (clients[i] !== socket) {
                        return clients[i];
                    }
                }
            }
        }
    };

    // Sends other guy's description to us
    var sendDescription = function () {
        var rcpt = getRecipient();
        if( rcpt ){
            // get other peer's description and send it to socket
            rcpt.get('description', function(e, description){
                if (description) {
                    socket.emit('description', {description: description});
                }
            });
        }
    };

    // Sends his candidates to us
    var sendCandidates = function () {
        var rcpt = getRecipient();
        if( rcpt ){
            // get candidates from other peer and send them to socket
            rcpt.get('candidates', function(e, candidates){
                if (candidates) {
                    candidates.map(function(candidate){
                        socket.emit('candidate', {candidate: candidate});
                    });
                }
            });
        }
    };

    socket.on('join room', function(data){
        if (!data.id) {
            // room id isn't specified
            return;
        }
        var clients = io.sockets.clients(data.id);
        if (clients.length < 2) {
            // join room
            socket.join(data.id);
            socket.emit('join room', {message: '', isCaller: clients.length !== 0});

            // send description and candidates of the other guy (if exist) to this socket
            sendDescription();
            sendCandidates();

            // console.log('Rooms a client has joined', io.sockets.manager.roomClients[socket.id]);
        } else if (clients.length > 1) {
            // room is full
            socket.emit('join room', {message: 'Room is full'});
        }
    });

    socket.on('candidate', function(data){
        console.log('candidate', data);
        // append candidate to array
        socket.get('candidates', function(e, candidates){
            candidates = candidates || [];
            candidates.push(data.candidate);
            socket.set('candidates', candidates);
            
            // send it to the other peer
            var rcpt = getRecipient();
            if (rcpt) {
                rcpt.emit('candidate', {candidate: data.candidate});
            }
        });
    });

    socket.on('description', function(data){
        console.log('description', data);
        socket.set('description', data.description);
        
        // send to other peer
        var rcpt = getRecipient();
        if (rcpt) {
            rcpt.emit('description', {description: data.description});
        }
    });
    
    socket.on('need_description', function(){
        sendDescription();
    });
    
    socket.on('need_candidates', function(){
        sendCandidates();
    });

    socket.on('disconnect', function(){
        var rooms = io.sockets.manager.roomClients[socket.id];
        console.log('rooms', rooms);

        // notify the other guy that he was left alone in the room
        for (var name in rooms){
            if (/^\//.test(name) && rooms[name]) {
                name = name.substr(1);
                io.sockets.in(name).emit('leave room');
            }
        }
    });

});