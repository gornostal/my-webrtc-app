define(function(){
    var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;

    return PeerConnection;
});