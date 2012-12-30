/*global console:false, define:false, $:false, RTCSessionDescription:false, RTCIceCandidate:false */

define([
  'backbone',
  'underscore',
  'text!templates/room.html',
  'module/getUserMedia',
  'module/peerConnection',
  'module/room',
  'module/socket'
], function (Backbone, _, roomTpl, getUserMedia, PeerConnection, room, socket) {

    var stunServer = {
        iceServers: [ {url: "stun:stun.l.google.com:19302"} ]
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
                that.establishConnection(isCaller);
            }, function(e){
                console.log('Error - room.join:', e);
            });

            room.onLeave(function(){
                console.log('User left the room');
                $('#remote-view video').remove();
            });
        },

        establishConnection: function(isCaller){
            var pc = new PeerConnection(stunServer);

            // send ice candidates to the other peer
            pc.onicecandidate = function (evt) {
                if(evt.candidate){
                    console.log('send candidate', evt.candidate);
                    socket.emit('candidate', {candidate: evt.candidate});
                }
            };

            // once remote stream arrives, show it in the remote video element
            pc.onaddstream = function (evt) {
                var video = document.createElement("video");
                video.autoplay = true;
                video.src = window.URL.createObjectURL(evt.stream);
                document.getElementById('remote-view').appendChild(video);
            };

            getUserMedia({video: true, audio: true}, function(localMediaStream){
                var video = document.createElement("video");
                video.autoplay = true;
                video.src = window.URL.createObjectURL(localMediaStream);
                document.getElementById('local-view').appendChild(video);

                var gotDescription = function(description){
                    // send our description to server
                    pc.setLocalDescription(description);
                    console.log('send local description', description);
                    socket.emit('description', {description: description});
                };
                
                pc.addStream(localMediaStream);

                // notify server that we need a remote description
                socket.emit('need_description');
                
                // we get a remote description
                socket.on('description', function(data){
                    console.log('received description', data);
                    pc.setRemoteDescription( new RTCSessionDescription(data.description) );
                    
                    // once we have it, we can set candidates
                    // notify server that we need candidates
                    socket.emit('need_candidates');
                    
                    // we got candidates
                    socket.on('candidate', function(data){
                        console.log('received candidate', data);
                        pc.addIceCandidate( new RTCIceCandidate(data.candidate) );
                    });
                    
                    if( !isCaller ){
                        // NOTE: createAnswer has to be called after callee receives a remote description
                        pc.createAnswer(gotDescription, function(e){
                            console.log('Error - createAnswer:', e);
                        });
                    }
                });

                if (isCaller) {
                    pc.createOffer(gotDescription, function(e){
                        console.log('Error - createOffer:', e);
                    });
                }
                
            }, function(e){
                console.log('Error - getUserMedia:', e);
            });
        }
    });

    return RoomView;
});
