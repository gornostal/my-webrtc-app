define(function(){
    return function(msg){
        var statusMsg = document.getElementById('status-msg');
        if( statusMsg ){
            statusMsg.innerHTML = msg;
        }
    };

});