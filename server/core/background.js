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
    return Cookier.update()
        .then(function(){
            return Updater.updateNext()
        })
        .then(function(res){
            if (!res) {
                //если нечего скачивать то спим минуту
                return Promise.delay(60000);
            }
            return
        })
};

module.exports = BackGround;