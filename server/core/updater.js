
var PgConditions = require("./../db/models/pg_conditions");
var PgConderrs = require("./../db/models/pg_conderrs");
var PgUrls = require("./../db/models/pg_urls");

var ex = require("./../db/models/pg_expressions");

var Searcher = require("./searcher");
var Cookier = require("./cookier");
var Downloader = require("./downloader");
var Params = require("./params");
var Promise = require('../utils/promise');
var Logger = require('../utils/logger');


var Updater = {};
/**************************
 *  Наружные функции
 **************************/

Updater.getNext = function () {
    return PgConditions.getNext()
        .then(function (condition) {
            Logger.DEBUG("Updater.getNext GET NEXT Condition_id " + condition.condition_id);
            return condition.condition_id
        })
};

Updater.update = function (condition_id) {
    Logger.DEBUG('Updater.update START condition_id ', condition_id);
    if (!condition_id) {
        return Promise.reject(new Error("condition_id can't be empty"));
    }
    var searchUrlsWithLinksAndParams;
    var corridors;
    var urlsWithParams;
    return Cookier.update()
        .then(function(){
            return PgConditions.lock(condition_id)
        })
        .then(function(){
            return Updater.updateSearch(condition_id)
        })
        .then(function (searchUrlsWithLinksAndParamsRes) {
            searchUrlsWithLinksAndParams = searchUrlsWithLinksAndParamsRes;
            Logger.DEBUG('searchUrlsWithLinksAndParams', JSON.stringify(searchUrlsWithLinksAndParams, null, 2));

            return Params.calcCorridors(searchUrlsWithLinksAndParams)
        })
        .then(function (corridorsRes) {
            corridors = corridorsRes;

            return Updater.updateOldUrls(condition_id)
        })
        .then(function (urlsWithParamsRes) {
            Logger.DEBUG('urlsWithParams', JSON.stringify(urlsWithParams, null, 2));
            urlsWithParams = urlsWithParamsRes

        })
        .then(function () {
            return ex.execute_list(ex.UPDATE_CONDITION_ALL(condition_id, searchUrlsWithLinksAndParams, corridors, urlsWithParams))
        })
        .catch(function (err) {
            return PgConderrs.insert(condition_id, err.name, err.message, err.stack)
                .then(function(){
                    throw err;
                })
        })
        .catch(function (err) {
            error = err;
            return PgConditions.incrementFailure(condition_id)
                .then(function(){
                    throw error;
                })
        })
        .finally(function(){
            return PgConditions.unlock(condition_id)
        });
};


/**************************
 *  Внутренние функции
 **************************/

Updater.updateSearch = function (condition_id) {
    if (!condition_id) {
        return Promise.reject(new Error("condition_id can't be empty"));
    }
    var condition;
    var error;
    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            condition = condition_res;
            Logger.DEBUG('START doSearch for ', JSON.stringify(condition, null, 2))
            return Searcher.generateSearchUrls(
                condition.sengine_name,
                condition.condition_query,
                condition.size_search,
                condition.sengine_qmask,
                condition.sengine_page_size,
                condition.region_code
            );
        })
        .then(function (searchUrls) {
            Logger.DEBUG('searchUrls', JSON.stringify(searchUrls, null, 2))
            return Searcher.getLinksFromSearcher(searchUrls)
        })
        .then(function (SearchUrlWithLinks) {
            Logger.DEBUG('SearchUrlWithLinks', JSON.stringify(SearchUrlWithLinks, null, 2))
            return Searcher.calcLinksParams(SearchUrlWithLinks, condition.condition_query)
        })

};

Updater.updateOldUrls = function (condition_id) {
    if (!condition_id) {
        return Promise.reject(new Error("condition_id can't be empty"));
    }
    var condition;
    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            condition = condition_res;
            return PgUrls.getOldUrls(condition_id)
        })
        .then(function (urls) {
            Logger.DEBUG('urls', JSON.stringify(urls, null, 2))
            return Searcher.calcUrlParams(urls, condition.condition_query)
        })
        .then(function (urlsWithParams) {
            Logger.DEBUG('urlsWithParams', JSON.stringify(urlsWithParams, null, 2))
            return urlsWithParams
        })
}

Updater.updateOneUrl = function (condition_id, url_id) {
    Logger.INFO('updateOneUrl: condition_id ' + condition_id + ' url_id ' + url_id);
    if (!condition_id) {
        return Promise.reject(new Error("condition_id can't be empty"));
    }
    if (!url_id) {
        return Promise.reject(new Error("url_id can't be empty"));
    }
    return PgConditions.checkActual(condition_id)
        .then(function (isActual) {
            if (isActual){
                return
            } else {
                return Updater.update(condition_id)
            }
        })
        .then(function () {
            return Updater.updateOneUrlWithoutCondition(condition_id, url_id)
        })
}

Updater.updateOneUrlWithoutCondition = function (condition_id, url_id) {
    if (!condition_id) {
        return Promise.reject(new Error("condition_id can't be empty"));
    }
    if (!url_id) {
        return Promise.reject(new Error("url_id can't be empty"));
    }
    var _condition;
    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            _condition = condition_res;
            return PgUrls.get(url_id)
        })
        .then(function (url) {
            Logger.DEBUG('url', JSON.stringify(url, null, 2))
            return Searcher.calcUrlParams([url], _condition.condition_query)
        })
        .then(function (urlsWithParams) {
            if (!urlsWithParams || urlsWithParams.length !=1) {
                throw new Error("url " + url_id + " not calc! " + urlsWithParams);
            }
            Logger.DEBUG('urlsWithParams', JSON.stringify(urlsWithParams))
            return urlsWithParams[0]
        })
        .then(function (paramsOfUrl) {
            return ex.execute_list(ex.UPDATE_URL_ALL(condition_id, paramsOfUrl))
        })
}





module.exports = Updater;