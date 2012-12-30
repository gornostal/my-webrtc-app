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
            new RoomView(room).render();
        }
    });

    return Router;
});