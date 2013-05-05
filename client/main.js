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
    'module/adapter',
    'text!templates/not-supported.html',
    'underscore',
    'backbone',
    'jquery'
    ],
    function(Router, adapter, notSupportedTpl, _, Backbone, $){
        $(document.body).removeClass('loading');
        if (adapter.RTCPeerConnection && adapter.getUserMedia) {
            new Router();
            Backbone.history.start({pushState: true});
        } else {
            document.body.innerHTML = _.template(notSupportedTpl)();
        }
    }
);