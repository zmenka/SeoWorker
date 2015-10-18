var SearchUrl = require('../models/SearchUrl');
var Promise = require('../utils/promise');
var Downloader = require('./downloader');
var SeoParameters = require('./seo_parameters');
var PgSpages = require("./../db/models/pg_spages");
var PgPositions = require("./../db/models/pg_positions");

var SearchParser = {};

/**
 * @param search_objects: SearchUrl[]
 * @param condition_id
 * @param user_id
 * @param sengine_name
 *
 * @returns SearchUrl[]
 */
SearchParser.getLinksFromSearcher = function (search_objects, condition_id, user_id, sengine_name) {
    if (!search_objects || !search_objects.length) {throw "SearchParser.getLinksFromSearcher. search_objects can't be empty";}
    if (!condition_id) {throw "SearchParser.getLinksFromSearcher. condition_id can't be empty";    }
    if (!user_id) {throw "SearchParser.getLinksFromSearcher. user_id can't be empty";}
    if (!sengine_name) {throw "SearchParser.getLinksFromSearcher. sengine_name can't be empty";}

    // create an empty promise to begin the chain
    var promises = []

    for (var i = 0; i < search_objects.length; i++) {

        var promise = (function (search_object) {

            var raw_html;
            var spage_id;
            console.log("сейчас обрабатывается поисковая ссылка ", search_object)

            return Downloader.getContentByUrlOrCaptcha(search_object.url, user_id, sengine_name, true)
                .then(function (html) {
                    raw_html = html;
                    return PgSpages.replace(condition_id, search_object.pageNumber)
                })
                .then(function (spage_id_res) {
                    spage_id = spage_id_res
                    //получим масси {url: <>, title: <>}

                    return new SeoParameters(raw_html)
                })
                .then(function (seoParameters) {
                    return seoParameters.getSearchPicks( search_object.sengineName)
                })
                .then(function (links) {
                    search_object.addLinks(links, spage_id)
                })


        })(search_objects[i])

        promises.push(promise)

    }
    return Promise.all(promises)
        .then(function () {
            return search_objects;
        })
        .then(function (res) {
            var sortedByPage = res.sort(function (a, b) {
                return a.pageNumber - b.pageNumber;
            });
            sortedByPage[0].setStart(0);
            for (var i = 1; i < sortedByPage.length; i++) {
                sortedByPage[i].setStart(sortedByPage[i - 1].getLinksLength() + sortedByPage[i - 1].getStart());
            }
            return sortedByPage
        })
};

module.exports = SearchParser;