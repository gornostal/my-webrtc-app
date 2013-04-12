define([
  'backbone',
  'jquery',
  'underscore',
  'text!templates/room.html',
  'module/adapter',
  'module/room',
  'module/chat',
  'module/socket',
  'module/dataChannel'
], function (Backbone, $, _, roomTpl, adapter, room, initChat, socket, initDataChannel) {

    var servers = {
        iceServers: [
            {url: "stun:stun.l.google.com:19302"},
            {url: "turn:agornostal%40cogniance.com@numb.viagenie.ca:3478", credential: 'webrtc'}
        ]
    };

    var RoomView = Backbone.View.extend({

        el: 'body',
        template: _.template(roomTpl),

        initialize: function(roomId){
            this.room = roomId;
        },

        render: function () {
            this.el.innerHTML = this.template({room: this.room});
            this.joinRoom(this.room);

            $('.hangup').click(function(){
                document.location.href = '/';
            });
        },

        joinRoom: function(roomId){
            var that = this;
            room.join(roomId, function(isCaller){
                console.log('isCaller -', isCaller);
                try{
                    that.establishConnection(isCaller);
                } catch(e) {
                    console.error(e);
                }
            }, function(e){
                alert(e);
                document.location.href = '/';
            });

            room.onLeave(function(){
                console.log('User left the room');
                $('#remote-view video').remove();
                $('#user-left').fadeIn(function(){
                    var $div = $(this);
                    setTimeout(function(){ $div.fadeOut(); }, 3e3);
                });
            });
        },

        establishConnection: function(isCaller){
            var pc = new adapter.RTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});

            var chat = initChat();
            var dataChannel = initDataChannel(pc, {
                onOpen: chat.activate,
                onClose: chat.deactivate(),
                onMessage: chat.onReceiveMsg
            });
            if( !dataChannel ){
                return false;
            }
            chat.onSendMsg = dataChannel.send.bind(dataChannel);

            // send ice candidates to the other peer
            pc.onicecandidate = function (evt) {
                if(evt.candidate){
                    console.debug('send candidate', evt.candidate);
                    socket.emit('candidate', {candidate: evt.candidate});
                }
            };

            // once remote stream arrives, show it in the remote video element
            pc.onaddstream = function (evt) {
                var video = document.createElement("video");
                adapter.attachMediaStream(video, evt.stream);
                document.getElementById('remote-view').appendChild(video);
            };
            adapter.getUserMedia({video: true, audio: true}, function(localMediaStream){
                var video = document.createElement("video");
                adapter.attachMediaStream(video, localMediaStream);
                document.getElementById('local-view').appendChild(video);

                var gotDescription = function(description){
                    // send our description to server
                    pc.setLocalDescription(description);
                    console.debug('send local description', description);
                    socket.emit('description', {description: description});
                };
                
                pc.addStream(localMediaStream);

                // notify server that we need a remote description
                socket.emit('need_description');
                
                // we get a remote description
                socket.on('description', function(data){
                    console.debug('received description', data);
                    pc.setRemoteDescription( new adapter.RTCSessionDescription(data.description) );
                    
                    // once we have it, we can set candidates
                    // notify server that we need candidates
                    socket.emit('need_candidates');
                    
                    // we got candidates
                    socket.on('candidate', function(data){
                        console.debug('received candidate', data);
                        pc.addIceCandidate( new adapter.RTCIceCandidate(data.candidate) );
                    });
                    
                    if( !isCaller ){
                        // NOTE: createAnswer has to be called after callee receives a remote description
                        pc.createAnswer(gotDescription, function(e){
                            console.error('Error - createAnswer:', e);
                        });
                    }
                });

                if (isCaller) {
                    pc.createOffer(gotDescription, function(e){
                        console.error('Error - createOffer:', e);
                    });
                }
                
            }, function(e){
                console.error('Error - getUserMedia:', e);
            });
        }
    });

    return RoomView;
});
