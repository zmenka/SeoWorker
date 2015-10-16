var KueUtils = require("./kue_utils");

var worker = KueUtils.getQueue();

KueUtils.registerTask(worker, 'testJob', function(){
    console.log('START test job')
    return Promise.delay(3000)
        .then(function(){
            console.log('END test job')
        })
})

module.exports = worker;