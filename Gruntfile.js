var asyncTask = require("grunt-promise-q");
var Backgrund = require('./server/core/background')

module.exports = function(grunt) {

    asyncTask.register(grunt, 'bg', 'Calc searh params.', function() {
        return Backgrund.run();
    });

};