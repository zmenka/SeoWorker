/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');
var PgDomain = require('./pg_domains');

var model = {};


model.find = function (url) {
    return PG.logQueryOneOrNone("SELECT * FROM urls U JOIN domains D USING(DOMAIN_ID) WHERE U.URL = $1;", [url] )
};

model.insert = function (url) {
    return PgDomain.insertIgnoreByUrl(url)
        .then(function(domain) {
            return PG.logQueryOneOrNone("INSERT INTO urls (URL, DOMAIN_ID, DATE_CREATE) SELECT $1, $2, $3 RETURNING URL_ID", [url, domain.domain_id, new Date()] )
        })
};

model.insertIgnore = function (url) {
    return model.find (url)
        .then(function(res){
            if(res) {
                return res;
            } else {
                return model.insert(url)
            }
        })
        .then(function(res) {
            return res;
        })
};

module.exports = model;
