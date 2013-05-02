define([
  'module/socket',
  'module/adapter',
  'module/chat',
  'module/dataChannel'
], function(socket, adapter, initChat, initDataChannel){

    var servers = {
        iceServers: [
            {url: "stun:stun.l.google.com:19302"},
            {url: "turn:agornostal%40cogniance.com@numb.viagenie.ca:3478", credential: 'webrtc'}
        ]
    };

    // Add an a=crypto line for SDP emitted by Firefox.
    // This is backwards compatibility for Firefox->Chrome calls because
    // Chrome will not accept a=crypto-less offers and Firefox only
    // does DTLS-SRTP.
    var ensureCryptoLine = function(sdp) {
        console.debug('Add an a=crypto line');

        var sdpLinesIn = sdp.split('\r\n');
        var sdpLinesOut = [];

        // Search for m line.
        for (var i = 0; i < sdpLinesIn.length; i++) {
            sdpLinesOut.push(sdpLinesIn[i]);
            if (sdpLinesIn[i].search('m=') !== -1) {
                sdpLinesOut.push(
                    "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:BAADBAADBAADBAADBAADBAADBAADBAADBAADBAAD");
            }
        }

        sdp = sdpLinesOut.join('\r\n');
        return sdp;
    };

    return function(isCaller){
        var pc = new adapter.RTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});

        var chat = initChat();
        var dataChannel = initDataChannel(pc, {
            onOpen: chat.activate,
            onClose: chat.deactivate,
            onMessage: chat.onReceiveMsg
        });
        if( dataChannel ){
            chat.onSendMsg = dataChannel.send.bind(dataChannel);
        }

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
            video.controls = true;
            adapter.attachMediaStream(video, evt.stream);
            document.getElementById('remote-view').appendChild(video);
        };

        adapter.getUserMedia({video: true, audio: true}, function(localMediaStream){
            var video = document.createElement("video");
            video.controls = true;
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
                pc.setRemoteDescription( new adapter.RTCSessionDescription(data.description), function(){
                    if( !isCaller ){
                        // NOTE: crateAnswer from within callback of setRemoteDescription to avoid race condition
                        console.debug('Create answer');
                        pc.createAnswer(gotDescription, function(e){
                            console.error('Error - createAnswer:', e);
                        });
                    }
                }, function(e){
                    console.error('Error - setRemoteDescription: ' + e);
                });

                // we got candidates
                socket.on('candidate', function(data){
                    console.debug('received candidate', data);
                    pc.addIceCandidate( new adapter.RTCIceCandidate(data.candidate) );
                });

                // once we have it, we can set candidates
                // notify server that we need candidates
                socket.emit('need_candidates');
            });

            if (isCaller) {
                console.debug('Create offer');
                pc.createOffer(function(offer){
                    if (adapter.webrtcDetectedBrowser === "firefox") {
                        offer.sdp = ensureCryptoLine(offer.sdp);
                    }
                    gotDescription(offer);
                }, function(e){
                    console.error('Error - createOffer:', e);
                });
            }

        }, function(e){
            console.error('Error - getUserMedia:', e);
        });
    };
});