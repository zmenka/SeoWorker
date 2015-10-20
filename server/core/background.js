var Cookier = require("./cookier");
var Updater = require("./updater");
var Promise = require("../utils/promise");


var BackGround = {};

BackGround.run = function () {
    console.log("BackGround.run START");
    function f() {
        return BackGround.action()
        .then(function () {
            return f();
        })
    }
    return f();
};

BackGround.action = function () {
    console.log("BackGround.run NEXT ITERATION !!!!");
    return Updater.getNext()
        .catch(function(res) {
            //либо нечего обновлять, лтбо что-то заблокировано, подождем
            return Promise.delay(60000);
            throw new Error('WAIT NEXT')
        })
        .then(function(condition_id){
            return Updater.update(condition_id)
        })
        .catch(function(err) {
            console.log(err.stack)
        })
};

module.exports = BackGround;