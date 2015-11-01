/**
 * Created by abryazgin on 14.10.15.
 */

var PG = require('../../utils/pg');

var PgUscondurls = {};

PgUscondurls.find = function (condurl_id, user_id) {
    return PG.logQueryOneOrNone("SELECT * FROM uscondurls WHERE CONDURL_ID = $1 AND USER_ID = $2", [condurl_id, user_id]);
};

PgUscondurls.insert = function (condurl_id, user_id) {
    return PG.logQueryOne("INSERT INTO uscondurls (CONDURL_ID, USER_ID, DATE_CREATE) SELECT $1, $2, $3 RETURNING USCONDURL_ID", [condurl_id, user_id, new Date()] );
};

PgUscondurls.remove = function (uscondurl_id) {
    return PG.logQuery("UPDATE uscondurls SET USCONDURL_DISABLED = TRUE WHERE USCONDURL_ID = $1", [uscondurl_id] );
};

PgUscondurls.new = function (user_id, url, query, size, region_id, sengine_id ) {
    return PG.logQueryOne(
        "SELECT USCONDURL_NEW ($1, $2, $3, $4, $5, $6);",
        [user_id, url, query, size, region_id, sengine_id]
    );
};

module.exports = PgUscondurls;
