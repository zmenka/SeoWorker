var PgConditions = require("./db/postgres/pg_conditions");
var PgSearch = require("./db/postgres/pg_search");
var PgScontents = require("./db/postgres/pg_scontents");
var PgHtmls = require("./db/postgres/pg_htmls");
var PgSpages = require("./db/postgres/pg_spages");
var PgParams = require("./db/postgres/pg_params");
var PgSengines = require("./db/postgres/pg_sengines");
var PgTasks = require("./db/postgres/pg_tasks")
var PgManager = require("./db/postgres/pg_manager")
var PgUsers = require("./db/postgres/pg_users")

var Searcher = require("./searcher");
var SearcherType = require("./searcher_type");
var SeoParameters = require("./seo_parameters");

var Q = require("q");

function Core() {
    // console.log('core init');
};

/**
 * Считаем параметры сайтов из выборки по заданному условию
 * @param condition_id
 * @param captcha
 * @param headers
 * @param user_id
 */
Core.prototype.bg = function () {
    var calcParams = this.calcParams;
    var calcSiteParams = this.calcParamsByUrl;
    function f() {
        return new PgManager().getCookieTaskUpdateTime()
            .then(function(date){
                //если куки удалялись больше чем 5 часов -чистим
                if (date && (Math.abs(new Date() - date) / 36e5) > 3){
                    console.log('Core.prototype.bg clean cookie!')
                    new PgUsers().deleteCookies()
                        .then(function(date){
                            new PgManager().updateCookieTaskUpdateTime(new Date())
                        })
                }

            })
            .catch(function (err) {
                console.log('Core.bg getCookieTaskUpdateTime err ', err);
            })
            .then(function(date){
                return new PgConditions().getLastNotSearchedRandomTask(10, new Date())
            })
            .catch(function (err) {
                console.log('Core.bg getLastNotSearchedRandomTask err ', err);
            })
            .then(function (res) {
                if (res) {
                    console.log('Core.bg START conds ', res.condition_id, res.task_id, res.url, res.is_cond_already_calc)
                    return Q.fcall(function () {
                        if (res.is_cond_already_calc) {
                            console.log('Core.bg calcParams conds ', res.condition_id, res.task_id, res.url, res.is_cond_already_calc, ' is_cond_already_calc')
                            return 'OK'
                        } else {
                            return calcParams(res["condition_id"], 1)
                                .catch(function (err) {
                                    console.log('Core.bg calcParams conds ', res.condition_id, res.task_id, res.url, res.is_cond_already_calc, ' , err ', err);
                                    throw 'next try';
                                })
                        }
                    })
                        .then(function (res1) {
                            return calcSiteParams(res.url, res.condition_id)
                                .catch(function (err) {
                                    console.log('Core.bg calcSiteParams conds ', res.condition_id, res.task_id, res.url, res.is_cond_already_calc, ' , err ', err);
                                    throw 'next try';
                                })
                        })

                        .then(function (res2) {
                            return new PgTasks().updateWithDateCalc(res.task_id, new Date())
                                .catch(function (err) {
                                    console.log('Core.bg updateWithDateCalc conds ', res.condition_id, res.task_id, res.url, res.is_cond_already_calc, ' , err ', err);
                                    throw 'next try';
                                })
                        })

                } else {
//                    console.log('Core.bg condition_id EMPTY');
                }
            })
            .catch(function (err) {
                console.log('Core.bg err ', err);
            })
            .then(function (res) {
                return  f();
            })
    }

    return f();

}
Core.prototype.calcParams = function (condition_id, user_id) {
    _this3 = this;
    var condition;
    var search_objects
    var getLinksFromSearcher = Core.prototype.getLinksFromSearcher;
    var calcLinksParams = Core.prototype.calcLinksParams;
    var search_id;

    return new PgConditions().getWithSengines(condition_id)
        .then(function (condition_res) {
            condition = condition_res
            if (!condition) {
                throw 'Core.prototype.calcParams Не найдены условия c condition_id ' + condition_id
            }

            //Формируется массив объектов {page:<>, url:<>, sengine:<>} для поиска
            search_objects = new SearcherType().getSearchUrls(condition)
//            console.log("урлы для поиска: ", search_objects)
            return new PgSearch().insert(condition_id)
        })
        .then(function (search_id_res) {
            search_id = search_id_res;
            //массив объектов {spage_id: <>,start<>, links: {url: <>, title: <>}[]}[]
            return getLinksFromSearcher(search_objects, search_id, user_id, condition.sengine_name)

        })
        .then(function (links_obj) {
            return calcLinksParams(links_obj, condition_id, condition.condition_query)
        })
        .then(function (res) {
            console.log('Core.prototype.calcParams done');
        })
        .catch(function (res) {
            if (res.captcha) {
                throw res;
            } else {
                console.error('Core.prototype.calcParams ', res, res.stack)
                throw  res;
            }

        })
}
/**
 *
 * @param search_objects массив объектов {page:<>, url:<>, sengine: <>}
 * @param search_id
 * @param captcha
 * @param headers
 * @param user_id
 * @returns {spage_id: <>,start<>, links: {url: <>, title: <>}[]}[]
 */
Core.prototype.getLinksFromSearcher = function (search_objects, search_id, user_id, sengine_name) {
    var result = []
    // create an empty promise to begin the chain
    var promise_chain = Q.fcall(function () {

    });

    for (var i = 0; i < search_objects.length; i++) {
        (function (search_object) {

            var promise_link = (function () {
                var raw_html;
                var spage_id;
//                console.log("сейчас обрабатывается поисковая ссылка ", search_object)

                return new Searcher().getContentByUrlOrCaptcha(search_object.url, null, user_id, sengine_name, true)
                    .then(function (res) {
                        raw_html = res.html;
                        return new PgHtmls().insertWithUrl(raw_html, search_object.url)
                    })
                    .then(function (html_id) {
                        return new PgSpages().insert(search_id, html_id, search_object.page)
                    })
                    .then(function (spage_id_res) {
                        spage_id = spage_id_res;
                        //получим масси {url: <>, title: <>}
                        return new SeoParameters().getSearchPicks(raw_html, search_object.sengine)
                    })
                    .then(function (links) {
                        console.log("Core.prototype.getLinksFromSearcher получили ", links.length, " ссылок из ", search_object.url)
                        // обнуляем капчу
                        captcha = null;
                        if (links.length == 0) throw "Core.prototype.getLinksFromSearcher Ссылки сайтов не получены из " + search_object.url;
//                        console.log(links)
                        result.push({spage_id: spage_id, links: links, page: search_object.page });
                    })
            })
            // add the link onto the chain
            promise_chain = promise_chain.then(promise_link);
        })(search_objects[i])


    }
    return promise_chain
        .then(function () {
            return result;
        })
        .then(function (res) {
//            console.log("!!!!!", res)
            var sortedByPage = res.sort(function (a, b) {
                return a.page - b.page;
            })
            sortedByPage[0].start = 0
            for (var i = 1; i < sortedByPage.length; i++) {
                sortedByPage[i].start = sortedByPage[i - 1].links.length + sortedByPage[i - 1].start;
            }
//            console.log("sortedByPage ", sortedByPage)
            return sortedByPage
        })
}
/**
 *
 * @param links_obj {spage_id: <>,start<>, links: {url: <>, title: <>}[]}[]
 * @returns {*}
 */
Core.prototype.calcLinksParams = function (links_obj, condition_id, condition_query) {
    var promises = [];
    for (var i = 0; i < links_obj.length; i++) {//links.length
        for (var j = 0; j < links_obj[i].links.length; j++) {
            (function (link, position, spage_id) {
//                console.log("сейчас обрабатывается ссылка ", link, position)
                promises.push((function (link, position, spage_id) {
                    var current_html_id;
                    var current_html;
                    return new Searcher().getContentByUrl(link.url)
                        .then(function (res) {
                            current_html = res.html
                            return new PgHtmls().insertWithUrl(escape(current_html), link.url)
                        })
                        .then(function (html_id) {
                            current_html_id = html_id;
                            return new PgScontents().insert(spage_id, html_id, position, false)
                        })
                        .then(function (scontent_id) {
                            return new SeoParameters().init(condition_query, current_html)
                        })
                        .then(function (params) {
                            var link_params = params.getAllParams()
                            return new PgParams().insert(condition_id, current_html_id, link_params)
                        })
                })(link, position, spage_id))
            })(links_obj[i].links[j], j + links_obj[i].start, links_obj[i].spage_id)
        }
    }
    return Q.allSettled(promises)
}

Core.prototype.calcParamsOld = function (condition_id, captcha, headers, user_id) {
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
                    if (res) {
                        if (res.page_number > 1) {
                            throw 'Данные уже обновлены.'
                            return
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
            url = condition.sengine_qmask + condition.condition_query.replace(/\s/g, '%20') + "%26p%3D" + page;
            console.log("хотим яндекс урл ", url)
            return new Searcher().getContentByUrlOrCaptcha(url, captcha, headers, user_id)
        })
        .then(function (res) {
            raw_html = res.html;
            return new PgHtmls().insertWithUrl(raw_html, url)
        })
        .then(function (html_id) {
            console.log('PgSpages().insert ', search_id, html_id, page)
            return new PgSpages().insert(search_id, html_id, page)
        })
        .then(function (spage_id_res) {
            spage_id = spage_id_res;

            return new SeoParameters().init(condition.condition_query, url, raw_html)
        })
        .then(function (params) {
            var links = params.getSearchPicks();
            console.log("получили ", links.length, " ссылок")
            var length = links.length;
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
            console.log("параметры успешно посчитаны")
//            return new PgSearch().listWithParams(condition_id)
        })

        .catch(function (res) {
            if (res.captcha) {
                throw res;
            } else {

                console.error('Core.prototype.calcParams ', res, res.stack)
                throw  res;
            }

        })
}

Core.prototype.calcParamsByUrl = function (url, condition_id) {
    var condition;
    var current_html_id;
    var current_html;
    return new PgConditions().getWithSengines(condition_id)
        .then(function (condition_res) {
            condition = condition_res;
            if (!condition) {
                throw 'Не найдены условия!'
            }
            return new Searcher().getContentByUrl(url)
        })
        .then(function (res) {
            current_html = res.html
            return new PgHtmls().insertWithUrl(escape(current_html), url)
        })
        .then(function (html_id) {
            current_html_id = html_id;
            return new SeoParameters().init(condition.condition_query, current_html)
        })
        .then(function (params) {
            var link_params = params.getAllParams()
            return new PgParams().insert(condition_id, current_html_id, link_params)
        })
        .then(function (res) {
            console.log(res)
            console.log("параметры САЙТА " + url + " успешно посчитаны")
        })
        .catch(function (res) {
            console.error('Core.prototype.calcParamsByUrl ', res, res.stack)
            throw  res;
        })
}

module.exports = Core;