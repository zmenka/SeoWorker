
var PgParams = require("./../db/models/pg_params");
var PgCorridors = require("./../db/models/pg_corridors");
var PgPercents = require("./../db/models/pg_percents");

var MathStat  = require("./../MathStat");
var Promise = require('../utils/promise');
var SeoParameters = require('./seo_parameters');

var params = {}

params.calcCoridors = function (condition_id) {
    if (!condition_id) {
        Promise.reject('for calcCoridors no condition_id')
    }
    return PgCorridors.setNotActual(condition_id)
        .then(function(){
            return PgParams.getParamtypes(condition_id)
        })
        .then(function (paramtypes) {
            if (!paramtypes) {
                throw new Error('Params.calcCoridors: no paramtypes for search')
            }
            var paramPromises = [];
            for (var i = 0; i < paramtypes.length; i++) {

                paramPromises.push((function (condition_id, paramtype_id) {

                    return PgParams.getParamDiagram(condition_id, paramtype_id)
                        .then(function (params) {
                            if (!params) {
                                throw new Error('Params.calcCoridors: no params for paramtype ' + paramtype_id + 'with condition_id ' + condition_id)
                            }
                            //получаем данные о "коридоре"
                            var mathstat = new MathStat(params.map(function (el) {
                                return parseFloat(el.value)
                            }));
                            mathstat.calc();
                            return PgCorridors.replace(condition_id, paramtype_id, mathstat.M, mathstat.D)
                        })

                })(condition_id, paramtypes[i].paramtype_id))

            }
            return Promise.all(paramPromises)
        })
        .then(function(){
            return PgCorridors.deleteNoActual(condition_id)
        })
};

params.processUrl = function(url_id, html, condition_id, condition_query){
    return PgParams.setNotActual(condition_id, url_id)
        .then(function () {
            return new SeoParameters(html)
        })
        .then(function (seoParams) {
            var allParams = seoParams.getAllParams(condition_query);
            var promises = [];
            var f = function (param, condition_id, url_id) {
                console.log("сейчас обрабатывается параметр ", param);
                PgParams.replaceByPtName(condition_id, url_id, param.name, param.val)
            };
            for (var i = 0; i < allParams.length; i++) {
                if (!allParams[i].val) {
                    continue;
                }
                promises.push(f(allParams[i], condition_id, url_id))
            }
            return Promise.all(promises)
        })
        .then(function () {
            return PgParams.deleteNoActual(condition_id, url_id)
        })
};
params.calcPercents = function(condurl_id){
    return PgPercents.calc(condurl_id)
};

module.exports = params;