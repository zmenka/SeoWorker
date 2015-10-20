var SearchUrl = require('../models/SearchUrl');
var Promise = require('../utils/promise');
var Downloader = require('./downloader');
var SeoParameters = require('./seo_parameters');
var PgSpages = require("./../db/models/pg_spages");
var PgPositions = require("./../db/models/pg_positions");

var SearchParser = {};

/**
 * @param search_objects: SearchUrlWithLinks[]
 * @param urls {url:string, url_id:number}[]
 *
 * @returns {url:string, url_id:number, position:number}[]
 */


SearchParser.getUrlsPositions = function (searchObjects, urls) {
    var positions = {};
    for (var i = 0; i < searchObjects.length; i++) {
        for (var j = 0; j < searchObjects[i].links.length; j++) {
            var link = searchObjects[i].links[j];
            var url = urls.filter(function (item) {
                return item.url == link.url
            })[0];
            if (url && !positions[url.url]) {
                var position = link.id + searchObjects[i].startLinksNumber;
                url.position = position
                positions[url.url] = position;
            }
        }
    }
};

module.exports = SearchParser;