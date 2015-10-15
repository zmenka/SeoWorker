/**
 * Created by abryazgin on 14.10.15.
 */

var PG = require('../../utils/pg');

var model = {};

model.find = function (domain) {
    return PG.logQueryOneOrNone("SELECT * FROM domains WHERE DOMAIN = $1", [domain]);
};

model.insert = function (domain) {
    return PG.logQueryOneOrNone("INSERT INTO domains (DOMAIN, DATE_CREATE) SELECT $1, $2 RETURNING DOMAIN_ID", [domain, new Date()] )
};

model.insertIgnore = function (domain) {
    return model.find (domain)
        .then(function(res){
            if(res) {
                return res;
            } else {
                return model.insert(domain)
            }
        })
        .then(function(res) {
            return res;
        })
};

model.insertIgnoreByUrl = function (url) {
    var domain = model.dopGetDomainByUrl(url);
    return model.insertIgnore(domain);
};

model.dopGetDomainByUrl = function (url){
    return url.match(/(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)/)[1].toLowerCase();
};

module.exports = model;