({
    name: "main",
    out: "main-built.js",
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimize: "none",
    paths: {
        require: 'lib/require',
        jquery: 'lib/jquery.min',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        text: 'lib/require-text',
        io: 'empty:'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        jquery: {
            exports: '$'
        }
    }
})
