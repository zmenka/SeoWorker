var  kue = require('kue')
var Promise = require('../utils/promise');
var Config = require('../config');

function getQueue() {
    return kue.createQueue({
        redis: Config.redis
    });
}
//handlePromise : function(data):Promise<any>
function registerTask(kue, taskName, handlePromise) {
    kue.process(taskName, 1, function (job, done) {
        return handlePromise(job.data)
            .then(function () {
                done()
            })
            .catch(function (err) {
                done(err)
            })
    });
}

function addTask(kue, taskName, data) {
    return new Promise(function (resolve, reject) {
        var job = kue.create(taskName, data)
            .save(function (err) {
                if (err) {
                    throw new Error(err)
                }
                resolve(job.id)
            }
        );
    })
}

function addTaskWithTime(kue, when, taskName, data) {
    return addTaskWithDelay(kue, when, taskName, data)
}

function addTaskWithDelay(kue, delayMilliseconds, taskName, data) {
    return new Promise(function (resolve, reject) {
        var job = kue.create(taskName, data)
            .delay(delayMilliseconds)
            .save(function (err) {
                if (err) {
                    throw new Error(err)
                }
                resolve(job.id)
            }
        );
    })
}

function getJobStateAndData(id, removeAfterComplete){
    return Promise.promisify(kue.Job.get)(id)
        .then(function (job) {
            if (!job){
                throw new Error('no job was found with id', id)
            }
            //if (removeAfterComplete && job && job.state() === 'complete' ){
            //    job.remove();
            //}
            return {state: job.state(), data: job.data}
        })
}

module.exports = {
    getQueue: getQueue,
    registerTask:  registerTask,
    addTask: addTask,
    addTaskWithTime: addTaskWithTime,
    addTaskWithDelay: addTaskWithDelay,
    getJobStateAndData: getJobStateAndData
}