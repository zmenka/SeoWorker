var PgConditions = require("./db/postgres/pg_conditions");
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


Core.prototype.calcParams = function (condition_id, captcha, headers, user_id) {
    var search_id;
    var url;
    var condition;
    var raw_html;
    return new PgConditions().getWithSengines(condition_id)
        .then(function (condition_res) {
            condition = condition_res
            url = condition.sengine_qmask + encodeURIComponent(condition.condition_query);

            return new Searcher().getContentByUrlOrCaptcha(url, captcha, headers, user_id)
        })

        .then(function (res) {
            raw_html = res.html;
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
            var links = params.getSearchPicks();
            console.log("получили ", links.length, " ссылок")
            var promises = [];
            for (var i = 1; i <= 1; i++) {//links.length

                (function (link, position) {
                    console.log("сейчас обрабатывается ссылка ", link, position)
                    promises.push((function (link, position) {
                        var current_html_id;
                        var current_html;
                        return new Searcher().getContentByUrl(link.url)
                            .then(function (res) {
                                current_html = res.html
                                return new PgHtmls().insertWithUrl(current_html, link.url)
                            })
                            .then(function (html_id) {
                                current_html_id = html_id;
                                return new PgScontent().insert(search_id, html_id, position, false)
                            })
                            .then(function (scontent_id) {
                                return new SeoParameters().init(condition.condition_query, link.url, current_html)
                            })
                            .then(function (params) {
                                var link_params = params.getAllParams()
                                return new PgParams().insert(condition_id, current_html_id, link_params)
                            })
                    })(link, position))
                })(links[i - 1], i)


            }

            return Q.all(promises)
        })
        .then(function (res) {
            console.log("параметры успешгно посчитаны")
            return new PgSearch().listWithParams(condition_id)
        })

        .catch(function (res) {
            if (res.captcha) {
                throw res;
            } else {
                throw 'Core.prototype.calcParams' + res;
            }

        })
}

module.exports = Core;