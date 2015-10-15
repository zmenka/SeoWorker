/**
 * Created by abryazgin on 14.10.15.
 */

var PG = require('../../utils/pg');

var model = {};

model.find = function (condurl_id, user_id) {
    return PG.logQueryOneOrNone("SELECT * FROM uscondurls WHERE CONDURL_ID = $1 AND USER_ID = $2", [condurl_id, user_id]);
};

model.insert = function (condurl_id, user_id) {
    return PG.logQueryOneOrNone("INSERT INTO uscondurls (CONDURL_ID, USER_ID, DATE_CREATE) SELECT $1, $2, $3 RETURNING USCONDURL_ID", [condurl_id, user_id, new Date()] );
};

model.insertIgnore = function (condurl_id, user_id) {
    return model.find (condurl_id, user_id)
        .then(function(res){
            if(res) {
                return res;
            } else {
                return model.insert(condurl_id, user_id)
            }
        })
        .then(function(res) {
            return res;
        })
};

module.exports = model;
