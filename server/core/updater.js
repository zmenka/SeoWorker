var PgCondurls = require("./../db/models/pg_condurls");
var PgPositions = require("./../db/models/pg_positions");
var PgConditions = require("./../db/models/pg_conditions");
var PgUrls = require("./../db/models/pg_urls");

var Searcher = require("./searcher");
var Downloader = require("./downloader");
var Params = require("./params");
var SearchParser = require("./search_parser");
var Promise = require('../utils/promise');


var Updater = {};
/**************************
 *  Наружные функции
 **************************/
Updater.updateNext = function () {
    return Updater.getNext()
        .then(function (condurl_id) {
            return Updater.update(condurl_id);
        })
};

Updater.getNext = function () {
    return PgCondurls.getNextNotSearched()
        .then(function (res) {
            console.log("Updater.getNext GET NEXT CONDURL " + res.condurl_id);
            return res.condurl_id;
        })
};

Updater.update = function (condurl_id) {
    console.log('Updater.update START condurl_id ', condurl_id)
    if (!condurl_id) {
        throw "Updater.update.  Condurl_id can't be empty";
    }
    return PgCondurls.get(condurl_id)
        .then(function (condurl_object) {
            return Updater.subUpdate(condurl_object.condition_id, condurl_object.url_id, condurl_id)
        })
        .then(function () {
            return PgCondurls.updateDateCalc(condurl_id)
        })

};


/**************************
 *  Внутренние функции
 **************************/
Updater.subUpdate = function (condition_id, url_id, condurl_id) {
    /**
     *  Обновление выдачи, корридора, параметров сайтов выдачи и параметров сайта пользователя
     **/
    if (!url_id) {
        throw "Updater.update.  url_id can't be empty";
    }
    if (!condition_id) {
        throw "Updater.getSearchUrls.  condition_id can't be empty";
    }

    return Updater.updateCondition(condition_id)
        .then(function (searchObjects) {
            return Updater.updatePositions(condition_id, searchObjects)
        })
        .then(function () {
            return Updater.updateUrl(url_id, condition_id, condurl_id)
        })
};

Updater.updateCondition = function (condition_id) {
    if (!condition_id) {
        throw "Updater.updateCondition.  condition_id can't be empty";
    }
    var searchUrls;
    return PgConditions.get(condition_id)
        .then(function (condition_res) {
            condition = condition_res
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
            return SearchParser.getLinksFromSearcher(searchUrls, condition_id, 1, condition.sengine_name)
        })
        .then(function (searchUrls_res) {
            searchUrls = searchUrls_res;
            return Searcher.calcLinksParams(searchUrls, condition_id, condition.condition_query)
        })
        .then(function () {
            return Params.calcCoridors
        })
        .then(function () {
            return searchUrls
        })
};

Updater.updatePositions = function (condition_id, searchObjects) {
    var positions = {};
    return PgCondurls.getUrlsByConditionId(condition_id)
        .then(function (urls) {
            var promises = []
            for (var i = 0; i < searchObjects.length; i++) {
                for (var j = 0; j < searchObjects[i].links.length; j++) {
                    var link = searchObjects[i].links[j];
                    var url = urls.filter(function (item) {
                        return item.url == link.url
                    })[0];
                    if (url) {
                        var position = j + searchObjects[i].start;
                        if (!(url.condurl_id in positions)) {
                            positions[url.condurl_id] = position;
                            promises.push(PgPositions.insert(url.condurl_id, position));
                        }
                    }
                }
            }
            return Promise.all(promises)
        })
};

Updater.updateUserUrl = function (condurl_id) {
    return PgCondurls.get(condurl_id)
        .then(function (condurl_object) {
            return Updater.updateUrl(condurl_object.url_id, condurl_object.condition_id, condurl_id);
        })
};
Updater.updateUrl = function (url_id, condition_id, condurl_id) {
    var isUserUrl = condurl_id ? true : false;
    if (!url_id) {
        throw "Updater.updateUrl.  url_id can't be empty";
    }
    if (!condition_id) {
        throw "Updater.updateUrl.  condition_id can't be empty";
    }

    console.log('Updater.updateUrl START url_id ', url_id, ' condition_id ', condition_id, ' isUserUrl ', isUserUrl);

    return Updater.downloadByUrlId(url_id)
        .then(function (html_object) {
            return Updater.calcUrlParamsByCondId(url_id, html_object.html, condition_id)
        })
        .then(function () {
            if (isUserUrl) {
                return Params.calcCoridors(condition_id)
            }
            return
        })
        .then(function () {
            if (isUserUrl) {
                return Params.calcPercents(condurl_id)
            }
            return
        })

};

Updater.downloadByUrlId = function (url_id) {
    return PgUrls.get(url_id)
        .then(function (url_object) {
            return Downloader.getContentByUrl(url_object.url);
        })
};
Updater.calcUrlParamsByCondId = function (url_id, html, condition_id) {
    return PgConditions.get(condition_id)
        .then(function (condition_object) {
            return Params.processUrl(url_id, html, condition_id, condition_object.condition_query);
        })
};

module.exports = Updater;