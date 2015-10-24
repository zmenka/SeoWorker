
var PgConditions = require("./../db/models/pg_conditions");
var PgUrls = require("./../db/models/pg_urls");

var ex = require("./../db/models/pg_expressions");

var Searcher = require("./searcher");
var Downloader = require("./downloader");
var Params = require("./params");
var Promise = require('../utils/promise');


var Updater = {};
/**************************
 *  Наружные функции
 **************************/

Updater.getNext = function () {
    var condition
    return PgConditions.getNextAndBlock()
        .then(function (condition_res) {
            condition = condition_res
            if (!condition){
                throw new Error('no next condition')
            }
            return PgUrls.blockByCondition(condition.condition_id)
        })
        .then(function () {
            console.log("Updater.getNext GET NEXT Condition_id " + condition.condition_id);
            return condition.condition_id
        })
};

Updater.update = function (condition_id) {
    console.log('Updater.update START condition_id ', condition_id);
    if (!condition_id) {
        return Promise.reject(new Error("condition_id can't be empty"));
    }
    var searchUrlsWithLinksAndParams;
    var corridors;
    var urlsWithParams;
    return PgConditions.lock(condition_id)
        .then(function(){
            return Updater.updateSearch(condition_id)
        })
        .then(function (searchUrlsWithLinksAndParamsRes) {
            searchUrlsWithLinksAndParams = searchUrlsWithLinksAndParamsRes;
            console.log('searchUrlsWithLinksAndParams', JSON.stringify(searchUrlsWithLinksAndParams, null, 2));

            return Params.calcCorridors(searchUrlsWithLinksAndParams)
        })
        .then(function (corridorsRes) {
            corridors = corridorsRes;

            return Updater.updateOldUrls(condition_id)
        })
        .then(function (urlsWithParamsRes) {
            console.log('urlsWithParams', JSON.stringify(urlsWithParams, null, 2));
            urlsWithParams = urlsWithParamsRes

        })
        .then(function () {
            return ex.execute_list(ex.UPDATE_CONDITION_ALL(condition_id, searchUrlsWithLinksAndParams, corridors))
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
            console.log('START doSearch for ', JSON.stringify(condition, null, 2))
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
            console.log('searchUrls', JSON.stringify(searchUrls, null, 2))
            return Searcher.getLinksFromSearcher(searchUrls)
        })
        .then(function (SearchUrlWithLinks) {
            console.log('SearchUrlWithLinks', JSON.stringify(SearchUrlWithLinks, null, 2))
            return Searcher.calcLinksParams(SearchUrlWithLinks, condition.condition_query)
        })
        .catch(function (err) {
            error = err;
            return PgConditions.incrementFailure(condition_id);
        })
        .then(function(){
            if (error){
                throw error;
            }
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
            console.log('urls', JSON.stringify(urls, null, 2))
            return Searcher.calcUrlParams(urls, condition.condition_query)
        })
        .then(function (urlsWithParams) {
            console.log('urlsWithParams', JSON.stringify(urlsWithParams, null, 2))
            return urlsWithParams
        })
}

Updater.updateOneUrl = function (condition_id, url_id) {
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
    var condition;
    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            condition = condition_res;
            return PgUrls.getAndBlock(url_id)
        })
        .then(function (url) {
            console.log('url', JSON.stringify(url, null, 2))
            return Searcher.calcUrlParams([url], condition.condition_query)
        })
        .then(function (urlsWithParams) {
            if (!urlsWithParams || urlsWithParams.length !=1) {
                throw new Error("url " + url_id + " not calc! " + urlsWithParams);
            }
            console.log('urlsWithParams', JSON.stringify(urlsWithParams, null, 2))
            return urlsWithParams[0]
        })
        .then(function (paramsOfUrl) {
            // засунуть это все в базу и СНЯТЬ блокировку
        })
}





module.exports = Updater;