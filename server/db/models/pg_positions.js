/**
 * Created by bryazginnn on 04.08.15.
 */

var PG = require('../../utils/pg');
var PgCondurls = require('./pg_condurls');
var PgUrls = require('./pg_urls');

var PgPositions = {};

PgPositions.find = function (condurl_id) {
    return PG.logQueryOneOrNone("SELECT * FROM positions WHERE CONDURL_ID = $1 WHERE IS_LAST IS TRUE", [condurl_id]);
};

PgPositions.insert = function (condurl_id, position) {
    return PgPositions.setNotActual(condurl_id)
        .then(function () {
            return PG.logQuery("INSERT INTO positions (CONDURL_ID, POSITION_N, DATE_CREATE, IS_LAST) " +
                "SELECT $1, $2, $3, TRUE RETURNING POSITION_ID", [condurl_id, position, new Date()])
        })
};

PgPositions.setNotActual = function (condurl_id) {
    return PG.logQuery("UPDATE positions SET IS_LAST = FALSE WHERE CONDURL_ID = $1", [condurl_id])
};

PgPositions.insertByUrl = function (url, position, condition_id) {

    return PgUrls.find(url)
        .then(function (url_object) {
            return PgCondurls.find(condition_id, url_object.url_id)
        })
        .then(function (condurl_object) {
            if (condurl_object) {
                return PgPositions.insert(condurl_object.condurl_id, position)
            }
        })
};

module.exports = PgPositions;

