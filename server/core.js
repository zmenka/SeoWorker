var PgConditions = require("./db/postgres/pg_conditions");
var PgSearch = require("./db/postgres/pg_search");
var PgScontents = require("./db/postgres/pg_scontents");
var PgHtmls = require("./db/postgres/pg_htmls");
var PgSpages = require("./db/postgres/pg_spages");
var PgParams = require("./db/postgres/pg_params");

var Searcher = require("./searcher");
var SeoParameters = require("./seo_parameters");

var Q = require("q");

function Core() {
   // console.log('core init');
};


Core.prototype.calcParams = function (condition_id, captcha, headers, user_id) {
    var search_id;
    var url;
    var condition;
    var raw_html;
    var sites_count = 0;
    var page = 0;
    var spage_id;
    return new PgConditions().getWithSengines(condition_id)
        .then(function (condition_res) {
            return new PgConditions().getCurrentSearchPage(condition_id, new Date(new Date() - 10 * 60000))
                .then(function (res) {
                    condition = condition_res
                    if (res){
                        if (res.page_number > 1){
                            throw 'уже все скачено'
                        }
                        page = res.page_number + 1
                        sites_count = res.count;
                        return res.search_id

                    } else {
                        return new PgSearch().insert(condition_id)
                    }

                })
        })
        .then(function (search_id_res) {
            search_id = search_id_res
            url = condition.sengine_qmask + (condition.condition_query) + "&p=" + page;

            return new Searcher().getContentByUrlOrCaptcha(url, captcha, headers, user_id)
        })
        .then(function (res) {
            raw_html = res.html;
            return new PgHtmls().insertWithUrl(raw_html, url)
        })
        .then(function (html_id) {
            console.log('!!!!', search_id, html_id, page)
            return new PgSpages().insert(search_id, html_id, page)
        })
        .then(function (spage_id_res) {
            spage_id = spage_id_res;

            return new SeoParameters().init(condition.condition_query, url, raw_html)
        })
        .then(function (params) {

            var links = params.getSearchPicks();
            console.log("получили ", links.length, " ссылок")
            var length = links.length<10 ? links.length: 10;
            var promises = [];
            for (var i = 1; i <= length; i++) {//links.length

                (function (link, position) {
                    console.log("сейчас обрабатывается ссылка ", link, position)
                    promises.push((function (link, position) {
                        var current_html_id;
                        var current_html;
                        return new Searcher().getContentByUrl(link.url)
                            .then(function (res) {
                                current_html = res.html
                                return new PgHtmls().insertWithUrl(escape(current_html), link.url)
                            })
                            .then(function (html_id) {
                                current_html_id = html_id;
                                return new PgScontents().insert(spage_id, html_id, position + parseInt(sites_count), false)
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

            return Q.allSettled(promises)
        })
        .then(function (res) {
            console.log(res)
            console.log("параметры успешгно посчитаны")
            return new PgSearch().listWithParams(condition_id)
        })

        .catch(function (res) {
            if (res.captcha) {
                throw res;
            } else {

                console.error(res, res.stack)
                throw 'Core.prototype.calcParams' + res;
            }

        })
}

module.exports = Core;