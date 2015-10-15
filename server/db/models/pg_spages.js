/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');
var PgScontents = require('./pg_scontents');

var model = {};

model.find = function (condition_id, page_number) {
    return PG.logQueryOneOrNone("SELECT * FROM spages WHERE CONDITION_ID = $1 AND PAGE_NUMBER = $2", [condition_id, page_number]);
};

model.insert = function (condition_id, page_number) {
    return PG.logQueryOneOrNone("INSERT INTO spages (CONDITION_ID, PAGE_NUMBER, DATE_CREATE) " +
        "SELECT $1, $2, $3 RETURNING SPAGE_ID", [condition_id, page_number, new Date()] )
};

model.delete = function (id) {
    return PG.logQueryOneOrNone("DELETE FROM scontents WHERE SPAGE_ID = $1", [id] )
        .then(function(){
            return PG.logQueryOneOrNone("DELETE FROM spages WHERE SPAGE_ID = $1", [id] )
        })
};

model.clearByCondition = function (condition_id) {
    return PgScontents.clearByCondition(condition_id)
        .then(function(){
            return PG.logQueryOneOrNone("DELETE FROM spages WHERE CONDITION_ID = $1", [condition_id] )
        })
};

model.replace = function (condition_id, page_number) {
    return model.find (condition_id, page_number)
        .then(function(res){
            if(res) {
                return model.delete(res.spage_id);
            }
            return
        })
        .then(function() {
            return model.insert(condition_id, page_number)
        })
        .then(function(res) {
            return res;
        })
};

module.exports = model;