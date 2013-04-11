define(function(){
    /**
     * returns dataChannel
     */
    return function(peerConnection, callbacks){

        callbacks = callbacks || {};
        
        // Reliable Data Channels not yet supported in Chrome
        // Data Channel api supported from Chrome M25
        var dataChannel;
        try{
            dataChannel = peerConnection.createDataChannel("sendDataChannel", {reliable: false});
        } catch(e) {
            alert('Failed to create data channel. ' +
                  'You need Chrome M25 or later with --enable-data-channels flag');
            console.error('Create Data channel failed with exception: ' + e.message);  
        }

        var ondataChannelStateChange = function(){
            var readyState = dataChannel.readyState;
            console.debug('Send channel state is: ' + readyState);
            if (readyState === "open") {
                // activate controls
                console.log('activate controls');
            } else {
                // deactivate controls
                console.log('deactivate controls');
            }
        };
        dataChannel.onopen = ondataChannelStateChange;
        dataChannel.onclose = ondataChannelStateChange;

        peerConnection.ondatachannel = function(e){
            console.debug('Receive Channel Callback');
            dataChannel = e.channel;
            dataChannel.onmessage = function(e){
                console.log('Received messate', e.data);
            };

            var onReceiveChannelStateChange = function(){
              var readyState = dataChannel.readyState;
              console.debug('Receive channel state is: ' + readyState);
            };
            dataChannel.onopen = onReceiveChannelStateChange;
            dataChannel.onclose = onReceiveChannelStateChange;  
        };

        return dataChannel;
    };
});