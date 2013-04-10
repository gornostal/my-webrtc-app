define(function(){

    var adapter = {
        RTCPeerConnection: null,
        getUserMedia: null,
        attachMediaStream: null,
        reattachMediaStream: null,
        webrtcDetectedBrowser: null
    };

    if (navigator.mozGetUserMedia) {
        // This appears to be Firefox

        adapter.webrtcDetectedBrowser = "firefox";

        // The RTCPeerConnection object.
        adapter.RTCPeerConnection = window.mozRTCPeerConnection;

        // The RTCSessionDescription object.
        adapter.RTCSessionDescription = window.mozRTCSessionDescription;

        // The RTCIceCandidate object.
        adapter.RTCIceCandidate = window.mozRTCIceCandidate;

        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        adapter.getUserMedia = navigator.mozGetUserMedia.bind(navigator);

        // Attach a media stream to an element.
        adapter.attachMediaStream = function(element, stream) {
            element.mozSrcObject = stream;
            element.play();
        };

        adapter.reattachMediaStream = function(to, from) {
            to.mozSrcObject = from.mozSrcObject;
            to.play();
        };

        // Fake get{Video,Audio}Tracks
        window.MediaStream.prototype.getVideoTracks = function() {
            return [];
        };

        window.MediaStream.prototype.getAudioTracks = function() {
            return [];
        };
    } else if (navigator.webkitGetUserMedia) {
        // This appears to be Chrome

        adapter.webrtcDetectedBrowser = "chrome";

        // The RTCPeerConnection object.
        adapter.RTCPeerConnection = window.webkitRTCPeerConnection;

        // Get UserMedia (only difference is the prefix).
        // Code from Adam Barth.
        adapter.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

        // Attach a media stream to an element.
        adapter.attachMediaStream = function(element, stream) {
            element.src = window.webkitURL.createObjectURL(stream);
            element.autoplay = true;
        };

        adapter.reattachMediaStream = function(to, from) {
            to.src = from.src;
        };

        // The RTCSessionDescription object.
        adapter.RTCSessionDescription = window.RTCSessionDescription;

        // The RTCIceCandidate object.
        adapter.RTCIceCandidate = window.RTCIceCandidate;

        // The representation of tracks in a stream is changed in M26.
        // Unify them for earlier Chrome versions in the coexisting period.
        if (!window.webkitMediaStream.prototype.getVideoTracks) {
            window.webkitMediaStream.prototype.getVideoTracks = function() {
                return this.videoTracks;
            };
            window.webkitMediaStream.prototype.getAudioTracks = function() {
                return this.audioTracks;
            };
        }

        // New syntax of getXXXStreams method in M26.
        if (!window.webkitRTCPeerConnection.prototype.getLocalStreams) {
            window.webkitRTCPeerConnection.prototype.getLocalStreams = function() {
                return this.localStreams;
            };
            window.webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
                return this.remoteStreams;
            };
        }
    }

    return adapter;
});