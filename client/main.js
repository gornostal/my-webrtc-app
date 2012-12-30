require.config({
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    },
    paths: {
        jquery: 'lib/jquery.min',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        text: 'lib/require-text',
        io: '/socket.io/socket.io'
    }
});

require([
    'module/router',
    'module/getUserMedia',
    'text!templates/not-supported.html',
    'underscore',
    'backbone'
    ],
    function(Router, getUserMedia, notSupportedTpl, _, Backbone){
        if (!getUserMedia) {
            document.body.innerHTML = _.template(notSupportedTpl)();
        } else {
            new Router();
            Backbone.history.start({pushState: true});
        }
    }
);