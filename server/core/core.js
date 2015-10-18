var BackGround = require("./background");


var Core = {};

Core.bg = function () {
    console.log("Core.bg START");
    return BackGround.run();
};

module.exports = Core;