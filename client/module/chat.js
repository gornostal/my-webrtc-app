define(['jquery'], function($){
    return function(){
        var $msg = $('#chat-msg'),
            $log = $('#chat-log'),
            isActive = false;

        var api = {
            activate: function(){
                isActive = true;
                $('.send-msg').removeClass('disabled');
            },
            deactivate: function(){
                isActive = false;
                $('.send-msg').addClass('disabled');
            },
            onReceiveMsg: function(msg){
                logChatMsg(false, msg);
            },
            onSendMsg: function(){} // will be overridden
        };

        var logChatMsg = function(isMine, msg){
            if(msg){
                var bubble = $('<div class="bubble-wrp">');
                bubble.append($('<div class="bubble">')
                    .addClass(isMine ? 'you' : 'me')
                    .text(msg));
                $log.append(bubble);
                $log.scrollTop($log[0].scrollHeight);
            }
        };

        $('#chat-form').submit(function(e){
            e.preventDefault();
            if(!isActive){
                return;
            }
            var text = $msg.val().trim();
            if(text && typeof api.onSendMsg === 'function' ){
                logChatMsg(true, text);
                api.onSendMsg(text);
                $msg.val('');
            }
        });

        return api;
    };
});