var PgUrls = require('../db/models/pg_urls');
var PgScontents = require('../db/models/pg_scontents');
var PgParams = require('../db/models/pg_params');

var SearchUrl = require('../models/SearchUrl');
var Downloader = require('./downloader');
var SeoParameters = require('./seo_parameters');
var Promise = require('../utils/promise');


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
        throw "Searcher.generateSearchUrls.  sengine_name can't be empty";
    }
    if (!condition_query) {
        throw "Searcher.generateSearchUrls.  condition_query can't be empty";
    }
    if (!size_search) {
        throw "Searcher.generateSearchUrls.  size_search can't be empty";
    }
    if (!sengine_qmask) {
        throw "Searcher.generateSearchUrls.  sengine_qmask can't be empty";
    }
    if (!sengine_page_size) {
        throw "Searcher.generateSearchUrls.  sengine_page_size can't be empty";
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
 * Формируется массив объектов SearchUrl для поиска
 * @links_obj SearchUrl[]
 * @param condition_id
 * @param condition_query
 *
 * @returns
 */
Searcher.calcLinksParams = function (links_obj, condition_id, condition_query) {
    var promises = [];
    for (var i = 0; i < links_obj.length; i++) {//links.length
        for (var j = 0; j < links_obj[i].links.length; j++) {
            var f = function (link, position, spage_id, to_downloading) {
                var current_url_id;
                var current_html;
                if (to_downloading) {
                    return Downloader.getContentByUrl(link.url)
                        .then(function (res) {
                            current_html = res.html;
                            return PgUrls.insertIgnore(link.url)
                        })
                        .then(function (url) {
                            current_url_id = url.url_id;
                            return PgScontents.insert(spage_id, current_url_id, position, false)
                        })
                        .then(function () {
                            return new SeoParameters(current_html)
                        })
                        .then(function (seoParams) {
                            var allParams = seoParams.getAllParams(condition_query);
                            var promises = [];
                            for (var i = 0; i < allParams.length; i++) {
                                if (!allParams[i].val) {
                                    continue;
                                }
                                var f = function (param, condition_id, html_id) {
                                    console.log("сейчас обрабатывается параметр ", param);
                                    return PgParams.replaceByPtName(condition_id, html_id, param.name, param.val)

                                };
                                promises.push(f(allParams[i], condition_id, current_url_id))
                            }
                            return Promise.all(promises)
                        })
                }
            };
            promises.push(f(links_obj[i].links[j], j + links_obj[i].start, links_obj[i].spage_id, links_obj[i].isNeedDownloading))
        }
    }
    return Promise.all(promises)
};


module.exports = Searcher;