module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-animate/angular-animate.js',
            'bower_components/angular-bootstrap/ui-bootstrap.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-motion/dist/angular-motion.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/angular-strap/dist/angular-strap.js',
            'bower_components/angular-ui-tree/dist/angular-ui-tree.js',
            'bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
            'client/js/**/*.js',
            'test/unit/**/*.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};