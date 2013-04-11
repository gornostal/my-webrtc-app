define(['backbone', 'views/home', 'views/room'], function(Backbone, HomeView, RoomView){
    var Router = Backbone.Router.extend({
        routes: {
            ''          : 'home',
            'room/:room': 'room'
        },
        home: function() {
            new HomeView().render();
        },
        room: function(room) {
            if( !/^[\-\w]+$/.test(room) ){
                alert('For room ID you can only use letters, numbers and _ -');
                document.location.href = '/';
            } else {
                new RoomView(room).render();
            }
        }
    });

    return Router;
});