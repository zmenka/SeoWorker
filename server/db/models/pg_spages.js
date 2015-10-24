/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');
var PgScontents = require('./pg_scontents');
var QueryList = require('../../models/QueryList');
var ex = require('./pg_expressions');

var PgSpages = {};

PgSpages.find = function (condition_id, page_number) {
    return PG.logQueryOneOrNone("SELECT * FROM spages WHERE CONDITION_ID = $1 AND PAGE_NUMBER = $2", [condition_id, page_number]);
};

PgSpages.insert = function (condition_id, page_number) {
    return PG.logQueryOne("INSERT INTO spages (CONDITION_ID, PAGE_NUMBER, DATE_CREATE) " +
        "SELECT $1, $2, $3 RETURNING SPAGE_ID", [condition_id, page_number, new Date()])
        .then(function (res) {
            return res.spage_id;
        })
};

PgSpages.delete = function (id) {
    return PG.logQueryOneOrNone("DELETE FROM scontents WHERE SPAGE_ID = $1", [id])
        .then(function () {
            return PG.logQueryOneOrNone("DELETE FROM spages WHERE SPAGE_ID = $1", [id])
        })
};

PgSpages.clearByCondition = function (condition_id) {
    return PgScontents.clearByCondition(condition_id)
        .then(function () {
            return PG.logQueryOneOrNone("DELETE FROM spages WHERE CONDITION_ID = $1", [condition_id])
        })
};

PgSpages.replace = function (condition_id, page_number) {
    var list = new QueryList();
    list.push(
        "DELETE FROM spages WHERE CONDITION_ID = $1 AND PAGE_NUMBER = $2",
        [condition_id, page_number]
    );
    list.push(
        "INSERT INTO spages (CONDITION_ID, PAGE_NUMBER, DATE_CREATE) " +
        "SELECT $1, $2, $3 RETURNING SPAGE_ID",
        [condition_id, page_number, new Date()]
    );
    return ex.execute_list(list)
        .then(function (res) {
            return res[res.length - 1][0].spage_id
        })
};

module.exports = PgSpages;