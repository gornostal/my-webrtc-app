define([
  'backbone',
  'jquery',
  'underscore',
  'text!templates/room.html',
  'module/room',
  'module/establishConnection',
  'module/setStatus'
], function (Backbone, $, _, roomTpl, room, establishConnection, setStatus) {


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
                    setStatus('Connection error');
                }
            }, function(e){
                alert(e);
                document.location.href = '/';
            });

            room.onLeave(function(){
                alert('User left the room');
                document.location.href = '/';
            });
        }
    });

    return RoomView;
});
