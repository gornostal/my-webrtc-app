define(['jquery'], function($){
    return function(){
        var $msg = $('#chat-msg'),
            $log = $('#chat-log');

        var logChatMsg = function(isMine, msg){
            var icon = isMine ? '>' : '<';
            msg = $('<div/>').text(msg).html();
            $log.append($('<div class="msg">').html('<b>' + icon + ' </b>' + msg));
            $log.scrollTop($log[0].scrollHeight);
        };

        $('#chat-form').submit(function(e){
            e.preventDefault();
            var text = $msg.val().trim();
            if(text){
                logChatMsg(true, text);
                $msg.val('');
            }
        });
    };
});