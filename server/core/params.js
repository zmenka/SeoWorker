
var MathStat = require("./../MathStat");
var Promise = require('../utils/promise');
var Logger = require('../utils/logger');
var SeoParameters = require('./seo_parameters');
var Corridor = require('../models/Corridor');
var params = {}


/**
 * @searchUrlsWithLinksAndParams searchUrlWithLinks[]
 *
 * @returns Corridor[]
 */
params.calcCorridors = function (searchUrlsWithLinksAndParams) {
    if (!searchUrlsWithLinksAndParams || !searchUrlsWithLinksAndParams.length) {
        throw new Error('no searchUrlsWithLinksAndParams ')
    }
    var params = {}
    for (var i = 0; i < searchUrlsWithLinksAndParams.length; i++) {
        var obj = searchUrlsWithLinksAndParams[i]
        for (var j = 0; j < obj.links.length; j++) {
            var link = obj.links[j]
            if (link.params) {
                for (var k = 0; k < link.params.length; k++) {
                    var param = link.params[k]
                    if (param.success) {
                        if (!params[param.name]) {
                            params[param.name] = [parseFloat(param.val)]
                        } else {
                            params[param.name].push(parseFloat(param.val))
                        }
                    }
                }
            }
        }
    }
    var corridors = []
    Logger.TRACE('params',params)
    for (var key in params) {
        //получаем данные о "коридоре"
        var mathstat = new MathStat(params[key]);
        mathstat.calc();
        var c = new Corridor(key, mathstat.M, mathstat.D)
        corridors.push(c)
    }
    Logger.TRACE('corridors', corridors)
    if (!corridors || !corridors.length) {
        throw new Error('corridors empty! ')
    }
    return corridors
};


module.exports = params;