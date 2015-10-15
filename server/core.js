var PgConditions = require("./db/models/pg_conditions");
var PgScontents = require("./db/models/pg_scontents");
var PgPositions = require("./db/models/pg_positions");
var PgSpages = require("./db/models/pg_spages");
var PgParams = require("./db/models/pg_params");
var PgUrls = require("./db/models/pg_urls");
var PgManager = require("./db/models/pg_manager");
var PgUsers = require("./db/models/pg_users");
var PgCorridor = require("./db/models/pg_corridors");

var Searcher = require("./searcher");
var SearcherType = require("./searcher_type");
var SeoParameters = require("./seo_parameters");

var MathStat = require("./MathStat")

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
            .then(function (date) {
                //если куки удалялись больше чем 5 часов -чистим
                if (date && (Math.abs(new Date() - date) / 36e5) > 3) {
                    console.log('Core.bg clean cookie!')
                    new PgUsers().deleteCookies()
                        .then(function (date) {
                            new PgManager().updateCookieTaskUpdateTime(new Date())
                        })
                }

            })
            .catch(function (err) {
                console.log('Core.bg getCookieTaskUpdateTime err ', err, err.stack);
            })
            .then(function (date) {
                return PgConditions.getLastNotSearchedRandomTask(10, new Date())
            })
            .catch(function (err) {
                console.log('Core.bg getLastNotSearchedRandomTask err ', err, err.stack);
            })
            .then(function (res) {
                if (res) {
                    console.log('Core.bg START condition_id ', res.condition_id,
                        ', task_id ', res.task_id, ', is_cond_already_calc ', res.is_cond_already_calc,
                        ', url ', res.url)
                    return calcSiteParams(res.url, res.condition_id, res.task_id)
                        .catch(function (err) {
                            console.log('Core.bg calcSiteParams conds ', res.condition_id, res.task_id, res.url, res.is_cond_already_calc, ' , err ', err);
                            throw 'next try';
                        })
                        .then(function () {
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
                        .then(function (res2) {
                            return PgConditions.updateDateCalc(res.condition_id)
                                .catch(function (err) {
                                    console.log('Core.bg updateWithDateCalc conds ', res.condition_id, res.url, res.is_cond_already_calc, ' , err ', err);
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
                return f();
            })
    }

    return f();

}
Core.prototype.calcParams = function (condition_id, user_id) {
    _this3 = this;
    var condition;
    var search_objects;
    var getLinksFromSearcher = Core.prototype.getLinksFromSearcher;
    var calcLinksParams = Core.prototype.calcLinksParams;
    var calcCoridors = Core.prototype.calcCoridors;
    var savePositions = Core.prototype.savePositions;
    var links_obj;

    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            condition = condition_res
            if (!condition) {
                throw new Error('Не найдены условия c condition_id ' + condition_id)
            }

            //Формируется массив объектов {page:<>, url:<>, sengine:<>} для поиска
            search_objects = new SearcherType().getSearchUrls(condition)
            return getLinksFromSearcher(search_objects, condition_id, user_id, condition.sengine_name)

        })
        .then(function (res_links_obj) {
            links_obj = res_links_obj
            return savePositions(links_obj, condition_id)
        })
        .then(function () {
            return calcLinksParams(links_obj, condition_id, condition.condition_query)
        })
        .then(function () {
            return calcCoridors(condition_id)
        })
        .then(function (res) {
            console.log('Расчет параметров для выборки с condition_id ', condition_id,
                ' и пользователем ', user_id, ' DONE');
        })
        .catch(function (res) {
            if (res.captcha) {
                throw res;
            } else {
                //console.error('Core.prototype.calcParams ', res, res.stack)
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
 * @returns {to_downloading: <true/false>, spage_id: <>,start<>, links: {url: <>, title: <>}[]}[]
 */
Core.prototype.getLinksFromSearcher = function (search_objects, condition_id, user_id, sengine_name) {
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
                        return PgUrls.insertIgnore(search_object.url)
                    })
                    .then(function (url) {
                        return PgSpages.replace(condition_id, url.url_id, search_object.page)
                    })
                    .then(function (spage) {
                        spage_id = spage.spage_id;
                        //получим масси {url: <>, title: <>}
                        return new SeoParameters().getSearchPicks(raw_html, search_object.sengine)
                    })
                    .then(function (links) {
                        //console.log("Получили ", links.length, " ссылок из ", search_object.url)

                        if (links.length == 0) throw new Error("Ссылки сайтов не получены из " + search_object.url);
//                        console.log(links)
                        result.push({
                            to_downloading: search_object.to_downloading,
                            spage_id: spage_id,
                            links: links,
                            page: search_object.page
                        });
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
            (function (link, position, spage_id, to_downloading) {
//               console.log("сейчас обрабатывается ссылка ", link, position)
                promises.push((function (link, position, spage_id, to_downloading) {
                    var current_url_id;
                    var current_html;
                    if (to_downloading) {
                        return new Searcher().getContentByUrl(link.url)
                            .then(function (res) {
                                current_html = res.html
                                return PgUrls.insertIgnore(link.url)
                            })
                            .then(function (url) {
                                current_url_id = url.url_id;
                                return PgScontents.insert(spage_id, current_url_id, position, false)
                            })
                            .then(function (scontent_id) {
                                return new SeoParameters().init(condition_query, current_html)
                            })
                            .then(function (params) {
                                var allParams = params.getAllParams()
                                var paramPromises = [];
                                for (var i = 0; i < allParams.length; i++) {
                                    if (!allParams[i].val) {
                                        continue;
                                    }
                                    (function (param, condition_id, html_id) {
                                        console.log("сейчас обрабатывается параметр ", param)
                                        var current_html_id;
                                        paramPromises.push(PgParams.replaceByPtName(condition_id, html_id, param.name, param.val))

                                    })(allParams[i], condition_id, current_html_id)

                                }

                                return Q.allSettled(paramPromises)
                            })
                    }
                })(link, position, spage_id, to_downloading))
            })(links_obj[i].links[j], j + links_obj[i].start, links_obj[i].spage_id, links_obj[i].to_downloading)
        }
    }
    return Q.allSettled(promises)
}
/**
 *
 * @param links_obj {spage_id: <>,start<>, links: {url: <>, title: <>}[]}[]
 * @returns {*}
 */
Core.prototype.savePositions = function (links_obj, condition_id) {
   var promises = [];
   for (var i = 0; i < links_obj.length; i++) {//links.length
       for (var j = 0; j < links_obj[i].links.length; j++) {
           (function (link, position, condition_id) {
//               console.log("сейчас обрабатывается ссылка ", link, position)
               promises.push(PgPositions.insertByUrlCond(link.url, position, condition_id))
           })(links_obj[i].links[j], j + links_obj[i].start, condition_id)
       }
   }
   return Q.allSettled(promises)
}

Core.prototype.calcCoridors = function (condition_id) {
    if (!condition_id) {
        throw new Error('for calcCoridors no condition_id')
    }
    return PgParams.getParamtypes(condition_id)
        .then(function (paramtypes) {
            if (!paramtypes) {
                throw new Errir('no paramtypes for search')
                return;
            }
            var paramPromises = [];
            for (var i = 0; i < paramtypes.length; i++) {

                (function (condition_id, paramtype_id) {

                    paramPromises.push(PgParams.getParamDiagram(condition_id, paramtype_id)
                        .then(function (params) {
                            if (!params) {
                                throw new Error('no params for paramtype ' + paramtype_id + 'with condition_id ' + condition_id)
                            }
                            //получаем данные о "коридоре"
                            var mathstat = new MathStat(params.map(function (el) {
                                return parseFloat(el.value)
                            }));
                            mathstat.calc();
                            return PgCorridor.insert(condition_id, paramtype_id, mathstat.M, mathstat.D)
                        })
                        .catch(function (res) {
                            //console.error('Core.prototype.calcCoridors ', res)
                            throw  res;
                        }))

                })(condition_id, paramtypes[i].paramtype_id)

            }

            return Q.allSettled(paramPromises)

        })
        .catch(function (err) {
            //console.error('Core.prototype.calcCoridors ', err )
            throw  err;
        })
}

Core.prototype.calcParamsByUrl = function (url, condition_id) {
    var condition;
    var current_url_id;
    var current_html;
    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            condition = condition_res;
            if (!condition) {
                throw 'Не найдены условия!'
            }
            return new Searcher().getContentByUrl(url)
        })
        .catch(function (err) {
            PgConditions.incrementFailure(condition_id, new Date())
            throw 'incrementFailure! ' + err;
        })
        .then(function (res) {
            current_html = res.html
            return PgUrls.insertIgnore(url)
        })
        .then(function (url) {
            current_url_id = url.url_id;
            return new SeoParameters().init(condition.condition_query, current_html)
        })
        .then(function (params) {
            var allParams = params.getAllParams()
            var promises = [];
            for (var i = 0; i < allParams.length; i++) {
                if (!allParams[i].val) {
                    continue;
                }
                (function (param, condition_id, url_id) {
                    console.log("сейчас обрабатывается параметр ", param)
                    promises.push(PgParams.replaceByPtName(condition_id, url_id, param.name, param.val))

                })(allParams[i], condition_id, current_url_id)

            }

            return Q.allSettled(promises)
        })
        .then(function (res) {
            //console.log(res)
            console.log("параметры САЙТА " + url + " успешно посчитаны")
        })
        .catch(function (res) {
            //console.error('Core.prototype.calcParamsByUrl ', res, res.stack)
            throw  res;
        })
}

module.exports = Core;