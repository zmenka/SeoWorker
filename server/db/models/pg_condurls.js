/**
 * Created by abryazgin on 14.10.15.
 */

var PG = require('../../utils/pg');

var model = {};

model.find = function (condition_id, url_id) {
    return PG.logQueryOneOrNone("SELECT * FROM condurls WHERE CONDITION_ID = $1 AND URL_ID = $2", [condition_id, url_id]);
};

model.insert = function (condition_id, url_id) {
    return PG.logQueryOneOrNone("INSERT INTO condurls (CONDITION_ID, URL_ID, DATE_CREATE) SELECT $1, $2, $3 RETURNING CONDURL_ID", [condition_id, url_id, new Date()] )
};

model.insertIgnore = function (condition_id, url_id) {
    return model.find (condition_id, url_id)
        .then(function(res){
            if(res) {
                return res;
            } else {
                return model.insert(condition_id, url_id)
            }
        })
        .then(function(res) {
            return res;
        })
};

module.exports = model;