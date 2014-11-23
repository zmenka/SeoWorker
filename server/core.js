var PgSearch = require("./db/postgres/pg_search");
var PgScontent = require("./db/postgres/pg_scontent");
var PgHtmls = require("./db/postgres/pg_htmls");
var PgParams = require("./db/postgres/pg_params");

var Searcher = require("./searcher");
var SeoParameters = require("./seo_parameters");

var Q = require("q");

function Core() {
    console.log('core init');
};


Core.prototype.calcParams = function (condition_id) {
    var search_id;
    return new PgConditions().getWithSengines(condition_id)
        .then(function (condition) {
            var url = condition.sengine_qmask + condition.condition_query;

            return new Searcher().getContentByUrl(url)
        })
        .then(function (raw_html) {
            return new PgHtmls().insertWithUrl(raw_html, url)
        })
        .then(function (html_id) {
            return new PgSearch().insert(condition_id, html_id)
        })
        .then(function (search_id_res) {
            search_id = search_id_res
            return new SeoParameters().init(condition.condition_query, url, raw_html)
        })
        .then(function (params) {
            var links = params.getSearchPicksArray();
            console.log("получили ", links.length, " ссылок")
            var promises = [];
            for (var i = 1; i <= links.length; i++) {
                promises.push(
                    (function (link, position) {
                        console.log("сейчас обрабатывается ссылка ", link, position)
                        var deferred = Q.defer();
                        return new Searcher().getContentByUrl(link.url)
                            .then(function (raw_html) {

                                return new PgHtmls().insertWithUrl(raw_html, link)
                            })
                            .then(function (html_id) {
                                return new PgScontent().insert(search_id, html_id, position, false)
                            })
                            .then(function (scontent_id) {
                                deferred.resolve(scontent_id);
                            })
                        return deferred.promise;
                    })(links[i - 1], i)
                )

            }

            return Q.all(promises)
        })
        .then(function (res) {
            console.log("параметры успешгно посчитаны")
            return new PgSearch().listWithParams(condition_id)
        })


        .catch(function (err) {
            errback(err);
        })
}

module.exports = Core;