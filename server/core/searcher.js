var PgUrls = require('../db/models/pg_urls');
var PgScontents = require('../db/models/pg_scontents');
var PgParams = require('../db/models/pg_params');

var SearchUrl = require('../models/SearchUrl');
var SearchUrlWithLinks = require('../models/SearchUrlWithLinks');
var Downloader = require('./downloader');
var SeoParameters = require('./seo_parameters');
var Promise = require('../utils/promise');

var PgConditions = require("./../db/models/pg_conditions");

var Searcher = {};
/**
 * Формируется массив объектов SearchUrl для поиска
 * @param sengine_name
 * @param condition_query
 * @param size_search
 * @param sengine_qmask
 * @param sengine_page_size
 * @param region_code
 *
 * @returns [<SearchUrl>,]
 */
Searcher.generateSearchUrls = function (sengine_name, condition_query, size_search, sengine_qmask, sengine_page_size, region_code) {
    if (!sengine_name) {
        throw new Error("sengine_name can't be empty");
    }
    if (!condition_query) {
        throw new Error("condition_query can't be empty");
    }
    if (!size_search) {
        throw new Error("size_search can't be empty");
    }
    if (!sengine_qmask) {
        throw new Error("sengine_qmask can't be empty");
    }
    if (!sengine_page_size) {
        throw new Error("sengine_page_size can't be empty");
    }

    var page = 0;
    var all_positions_count = 50;
    var size_page = sengine_page_size;
    var searchUrls = [];
    var search_count = 0;
    var words;
    switch (sengine_name) {
        case 'Google':
            //https://www.google.ru/search?q=%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82+iphone&newwindow=1&start=70
            words = condition_query
                .split(/\s/)
                .map(function (item) {
                    return encodeURIComponent(item)
                })
                .join('+');
            break;
        case 'Yandex':
            if (!region_code) {
                throw 'Searcher.generateSearchUrls Не определен region_code!'
            }
            words = condition_query
                .split(/\s/)
                .map(function (item) {
                    return encodeURIComponent(item)
                })
                .join('%20');
            break;
    }
    if (!words) {
        throw 'Searcher.generateSearchUrls Не определен words!'
    }
    while (search_count < all_positions_count) {
        var isNeedDownloading = search_count < size_search;
        var url;
        switch (sengine_name) {
            case 'Yandex':
                url = sengine_qmask + 'lr=' + region_code + '&text=' + words + "&p=" + page;
                break;
            case 'Google':
                url = sengine_qmask + 'q=' + words + (search_count > 0 ? '&start=' + search_count : "");
                break;
            default:
                throw new Error('Не найден требуемый поисковик!');
        }
        searchUrls.push(new SearchUrl(isNeedDownloading, page, sengine_name, url));
        search_count += size_page;
        page++;
    }
    return searchUrls;
};

/**
 * Скачивает выборку и парсит сайты
 * @param sengine_name; SearchUrl[]
 * @param condition_id
 * @param user_id
 * @param sengine_name
 *
 * @returns SearchUrlWithLinks[]
 */
Searcher.getLinksFromSearcher = function (search_objects) {

    if (!search_objects || !search_objects.length) {
        return Promise.reject(new Error("search_objects can't be empty"));
    }

    var promises = []

    for (var i = 0; i < search_objects.length; i++) {//

        var promise = (function (search_object) {

            //console.log("сейчас обрабатывается поисковая ссылка ", search_object)

            return Downloader.getContentByUrlOrCaptcha(search_object.url, null, search_object.sengineName, true)
                .then(function (html) {
                    //получим масси {url: <>, title: <>}
                    return new SeoParameters(html)
                })
                .then(function (seoParameters) {
                    return seoParameters.getSearchPicks(search_object.sengineName)
                })
                .then(function (links) {
                    return new SearchUrlWithLinks(search_object.url, links, search_object.pageNumber, search_object.isNeedDownloading)
                })


        })(search_objects[i])

        promises.push(promise)

    }
    return Promise.all(promises)
        .then(function (new_search_objects) {
            var sortedByPage = new_search_objects.sort(function (a, b) {
                return a.pageNumber - b.pageNumber;
            });
            sortedByPage[0].startLinksNumber = 0;
            for (var i = 1; i < sortedByPage.length; i++) {
                sortedByPage[i].startLinksNumber = sortedByPage[i - 1].links.length + sortedByPage[i - 1].startLinksNumber;
            }

            return sortedByPage
        })
};

/** считает параметры
 * @links_obj searchUrlWithLinks[]
 * @param condition_id
 * @param condition_query
 *
 * @returns searchUrlWithLinks[]
 */
Searcher.calcLinksParams = function (links_obj, condition_query) {
    if (!condition_query ) {
        return Promise.reject(new Error("condition_query can't be empty"));
    }
    var promises1 = [];
    for (var i = 0; i < links_obj.length; i++) {

        var f1 = function (searchUrlWithLinks) {

            var promises2 = [];
            for (var j = 0; j < searchUrlWithLinks.links.length; j++) {
                var f2 = function (link,  to_downloading) {
                    if (to_downloading) {
                        return Downloader.getContentByUrl(link.url)
                            .then(function (res) {
                                return new SeoParameters(res.html)
                            })
                            .then(function (seoParams) {
                                link.params = seoParams.getAllParams(condition_query);
                                return link
                            })
                    } else {
                        return link
                    }
                };
                promises2.push(f2(searchUrlWithLinks.links[j], searchUrlWithLinks.isNeedDownloading))
            }

            return Promise.settle(promises2)
                .then(function (promiseResults2) {
                    if (!promiseResults2 || !promiseResults2.length) {
                        throw new Error('no params was calc for ' + searchUrlWithLinks)
                    }
                    searchUrlWithLinks.links = []
                    for (var j = 0; j < promiseResults2.length; j++) {
                        var r = promiseResults2[j]
                        if (r.isFulfilled()) {  // check if was successful
                            searchUrlWithLinks.links.push(r.value())
                        } else if (r.isRejected()) { // check if the read failed
                            console.log('Не посчитались параметры', r.reason(), r); //reason
                        }
                    }
                    return searchUrlWithLinks
                })
        }

        promises1.push(f1(links_obj[i]))
    }
    return Promise.settle(promises1)
        .then(function (promiseResults) {
            if (!promiseResults || !promiseResults.length) {
                throw new Error('no promiseResults with params')
            }
            var res = []
            for (var j = 0; j < promiseResults.length; j++) {
                var r = promiseResults[j]
                if (r.isFulfilled()) {  // check if was successful
                    res.push(r.value())
                } else if (r.isRejected()) { // check if the read failed
                    console.log('Не посчитались параметры', r.reason(), r); //reason
                }
            }
            return res
        })
};

/**
 * Скачивает  сайты, считает параметры
 * @param urls; {url:string, url_id:number}[]
 * @param condition_query
 *
 * @returns {url:string, url_id:number, params:any[]}[]
 */
Searcher.calcUrlParams = function (urls, condition_query) {
    if (!urls || !urls.length) {
        return Promise.reject(new Error("urls can't be empty"));
    }
    if (!condition_query ) {
        return Promise.reject(new Error("condition_query can't be empty"));
    }

    var promises = []
    for (var i = 0; i < urls.length; i++) {

        var promise = (function (url) {

            //console.log,("сейчас обрабатывается урл ", url)
            return Downloader.getContentByUrl(url.url)
                .then(function (res) {
                    return new SeoParameters(res.html)
                })
                .then(function (seoParams) {
                    url.params = seoParams.getAllParams(condition_query);
                    return url
                })
                .catch(function (err) {
                    return PgUrls.incrementFailure(url.url_id);
                    throw err
                })


        })(urls[i])

        promises.push(promise)

    }
    return Promise.settle(promises)
        .then(function (promiseResults) {
            var res = []
            for (var j = 0; j < promiseResults.length; j++) {
                var r = promiseResults[j]
                if (r.isFulfilled()) {  // check if was successful
                    res.push(r.value())
                } else if (r.isRejected()) { // check if the read failed
                    console.log('Не посчитались параметры', r.reason(), r); //reason
                }
            }
            return res
        })
};


module.exports = Searcher;