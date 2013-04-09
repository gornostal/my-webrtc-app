define(['backbone', 'jquery', 'text!templates/home.html'], function (Backbone, $, homeTpl) {

    var HomeView = Backbone.View.extend({

        el: 'body',

        render: function () {
            this.el.innerHTML = homeTpl;
            $('form').submit(this.joinRoom);
        },

        joinRoom: function () {
            var roomId = $('input').val();
            if( /^[\-\w]+$/.test(roomId) ){
                new Backbone.Router().navigate('/room/'+roomId, {trigger: true});
            } else {
                alert('You can use letters, numbers and _ -');
            }
            return false;
        }
    });

    return HomeView;
});
