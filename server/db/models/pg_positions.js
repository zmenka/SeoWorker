/**
 * Created by bryazginnn on 04.08.15.
 */

var PG = require('../../utils/pg');
var PgUrl = require('./pg_urls');
var PgCondurl = require('./pg_condurls');

var model = {};

model.find = function (condurl_id) {
	return PG.logQueryOneOrNone("SELECT * FROM positions WHERE CONDURL_ID = $1 ORDER BY DATE_CREATE DESC LIMIT 1", [condurl_id]);
};

model.insert = function (condurl_id, position) {
	return PG.logQueryOneOrNone("INSERT INTO positions (CONDURL_ID, POSITION_N, DATE_CREATE) SELECT $1, $2, $3 RETURNING POSITION_ID", [condurl_id, position, new Date()] )
};

model.insertByUrlCond = function (url, position, condition_id) {
	return PgUrl.insertIgnore(url)
		.then(function (res) {
			return PgCondurl.insertIgnore(condition_id, res.url_id)
		})
		.then(function (res){
			return model.insert (res.condurl_id, position)
		})

};

module.exports = model;

