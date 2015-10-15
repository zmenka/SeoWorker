/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');

var model = {};

model.find = function (spage_id, position) {
    return PG.logQueryOneOrNone("SELECT * FROM scontents WHERE SPAGE_ID = $1 AND POSITION_N = $2", [spage_id, position]);
};

model.insert = function (spage_id, url_id, position, is_commercial) {
    return PG.logQueryOneOrNone("INSERT INTO scontents (SPAGE_ID, URL_ID, POSITION_N, IS_COMMERCIAL, DATE_CREATE) " +
        "SELECT $1, $2, $3, $4, $5 RETURNING SCONTENT_ID", [spage_id, url_id, position, is_commercial, new Date()] )
};

model.delete = function (id) {
    return PG.logQueryOneOrNone("DELETE FROM scontents WHERE SCONTENT_ID = $1", [id] )
};

model.clearByCondition = function (condition_id) {
    return PG.logQueryOneOrNone("DELETE FROM scontents AS D USING spages SP WHERE D.SPAGE_ID = SP.SPAGE_ID AND SP.CONDITION_ID = $1", [condition_id] )
};

model.replace = function (spage_id, url_id, position, is_commercial) {
    return model.find (spage_id, position)
        .then(function(res){
            if(res) {
                return model.delete(res.scontent_id);
            }
            return
        })
        .then(function() {
            return model.insert(spage_id, url_id, position, is_commercial)
        })
        .then(function(res) {
            return res;
        })
};

module.exports = model;