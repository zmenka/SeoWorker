var Promise = require("../../server/utils/promise");

describe('Params', function () {

    it.only('считаем параметры', function () {
        var cond_id = 3;
        var url_id = 1;
        var Updater = require("../../server/core/updater");
        return Updater.updateOneUrlWithoutCondition(cond_id, url_id)
            .then(function (res) {
                console.log('ugu', JSON.stringify(res, null,2))
            })
            .catch(function (err) {
                console.error('aga', err)
                console.error('aga STACK', err.stack)
            })
    })



    it('111', function () {
        var Downloader = require("../../server/core/downloader");
        return Downloader.antigateBalance()
            .then(function (res) {
                console.log('ugu', res)
            })
            .catch(function (err) {
                console.error('aga', err.stack)
                throw err
            })
    })
})


