define(['underscore'], function(_){
    /**
     * returns dataChannel
     */
    return function(peerConnection, callbacks){

        var defaultCallbacks = {
            onOpen: function(){},
            onClose: function(){},
            onMessage: function(){}
        };
        callbacks = _.extend({}, defaultCallbacks, callbacks);


        var dataChannel;
        if (navigator.webkitGetUserMedia) {
            // Reliable Data Channels not yet supported in Chrome
            // Data Channel api supported from Chrome M25
            try{
                dataChannel = peerConnection.createDataChannel("sendDataChannel", {reliable: false});
            } catch(e) {
                alert('Failed to create data channel. ' +
                      'You need Chrome M25 or later with --enable-data-channels flag');
                console.error('Create Data channel failed with exception: ' + e.message);
                return false;
            }

        } else {
            try{
                peerConnection.connectDataConnection(5001, 5000);
                dataChannel = peerConnection.createDataChannel("channel", {});
                dataChannel.binaryType = 'blob';
            } catch(e) {
                // alert('Your browser does not support DataChannel API. Try to update the browser');
                console.error('Create Data channel failed with exception: ' + e.message);
                return false;
            }
        }

        var ondataChannelStateChange = function(){
            var readyState = dataChannel.readyState;
            console.debug('Send channel state is: ' + readyState);
            if (readyState === "open") {
                callbacks.onOpen();
            } else {
                callbacks.onClose();
            }
        };
        dataChannel.onopen = ondataChannelStateChange;
        dataChannel.onclose = ondataChannelStateChange;
        dataChannel.onmessage = function(e){
            console.debug('Received message', e.data);
            callbacks.onMessage(e.data);
        };

        return dataChannel;
    };
});