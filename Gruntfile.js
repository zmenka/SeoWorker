var asyncTask = require("grunt-promise-q");
var Core = require('./server/core/core.js')

module.exports = function(grunt) {

    asyncTask.register(grunt, 'bg', 'Calc searh params.', function() {
        return new Core().bg();
    });

};