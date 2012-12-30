define(function(){
    navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    // somehow if I return navigator.getUserMedia_, things don't work
    // thus use proxy
    return navigator.getUserMedia_ && function(options, callback, errorCallback){
        navigator.getUserMedia_(options, callback, errorCallback);
    };
});
