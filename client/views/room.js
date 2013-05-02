define([
  'backbone',
  'jquery',
  'underscore',
  'text!templates/room.html',
  'module/room',
  'module/establishConnection'
], function (Backbone, $, _, roomTpl, room, establishConnection) {


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
            room.join(roomId, function(isCaller){
                console.log('isCaller -', isCaller);
                try{
                    establishConnection(isCaller);
                } catch(e) {
                    console.error(e);
                }
            }, function(e){
                alert(e);
                document.location.href = '/';
            });

            room.onLeave(function(){
                console.log('User left the room');
                $('#remote-view video').remove();
                $('#user-left').fadeIn(function(){
                    var $div = $(this);
                    setTimeout($div.fadeOut().bind($div), 3e3);
                });
            });
        }
    });

    return RoomView;
});
