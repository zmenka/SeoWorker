/**
 * Created by bryazginnn on 22.11.14.
 */

var PG = require('../../utils/pg');

var PgScontents = {};

PgScontents.find = function (spage_id, position) {
    return PG.logQueryOneOrNone("SELECT * FROM scontents WHERE SPAGE_ID = $1 AND POSITION_N = $2", [spage_id, position]);
};

PgScontents.insert = function (spage_id, url_id, position, is_commercial) {
    return PG.logQueryOneOrNone("INSERT INTO scontents (SPAGE_ID, URL_ID, POSITION_N, IS_COMMERCIAL, DATE_CREATE) " +
        "SELECT $1, $2, $3, $4, $5 RETURNING SCONTENT_ID", [spage_id, url_id, position, is_commercial, new Date()] )
};

PgScontents.delete = function (id) {
    return PG.logQueryOneOrNone("DELETE FROM scontents WHERE SCONTENT_ID = $1", [id] )
};

PgScontents.clearByCondition = function (condition_id) {
    return PG.logQueryOneOrNone("DELETE FROM scontents AS D USING spages SP WHERE D.SPAGE_ID = SP.SPAGE_ID AND SP.CONDITION_ID = $1", [condition_id] )
};

PgScontents.replace = function (spage_id, url_id, position, is_commercial) {
    var list = [];
    list.push({
        queryText: "DELETE FROM scontents WHERE SPAGE_ID = $1 AND POSITION_N = $2",
        valuesArray: [spage_id, position]
    });
    list.push({
        queryText:"INSERT INTO scontents (SPAGE_ID, URL_ID, POSITION_N, IS_COMMERCIAL, DATE_CREATE) " +
        "SELECT $1, $2, $3, $4, $5 RETURNING SCONTENT_ID",
        valuesArray:  [spage_id, url_id, position, is_commercial, new Date()]
    });
    return PG.transactionSync(list)
        .then(function (res) {
            return res[res.length - 1][0].scontent_id
        })
};

module.exports = PgScontents;