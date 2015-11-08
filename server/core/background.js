var Cookier = require("./cookier");
var Updater = require("./updater");
var Promise = require("../utils/promise");
var Logger = require("../utils/logger");


var BackGround = {};

BackGround.run = function () {
    Logger.INFO("BackGround.run START");
    function f() {
        return BackGround.action()
        .then(function () {
            return f();
        })
    }
    return f();
};

BackGround.action = function () {
    var wait_next_message = 'WAIT NEXT';
    Logger.INFO("BackGround.run NEXT ITERATION !!!!");
    return Updater.getNext()
        .catch(function(err) {
            console.log('getNext', err.stack)
            //либо нечего обновлять, лтбо что-то заблокировано, подождем
            return Promise.delay(60000)
            .then(function(){
                throw new Error(wait_next_message)
            })

        })
        .then(function(condition_id){
            return Updater.update(condition_id)
        })
        .catch(function(err) {
            if (err.message == wait_next_message){
                Logger.INFO(wait_next_message)
            }else{
                Logger.ERROR(err.stack)
            }
        })
};

module.exports = BackGround;