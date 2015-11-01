var Promise = require("../../server/utils/promise");

describe('Params', function () {

    it.only('считаем параметры', function () {
        var cond_id = 3;
        var url_id = 1;
        var cond_id = 1369;
        var url_id = 84537;
        //  url_id: 84537, condition_id: 1369
        var Updater = require("../../server/core/updater");
        return Updater.updateOneUrlWithoutCondition(cond_id, url_id)
            .then(function (res) {
                console.log('ugu', JSON.stringify(res, null,2))
            })
            .catch(function (err) {
                console.error('aga', JSON.stringify(err, null,2))
                console.error('aga STACK', err.stack)
            })
    })


})


