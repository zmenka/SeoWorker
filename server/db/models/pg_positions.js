/**
 * Created by bryazginnn on 04.08.15.
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');
var PgUrls = require('./pg_urls');
var PgExpressions = require("./pg_expressions");

function PgPositions() {

};

PgPositions.prototype.insert = function (url, position, search_id) {

	var date_create = new Date();
	// create a Url
	var db
	express = new PgExpressions()
	list = []
	list.push("INSERT INTO urls (url, date_create) " +
		"SELECT '" + url + "', '" + date_create.toISOString() + "' " +
		"WHERE NOT EXISTS (SELECT 1 FROM urls WHERE url = '" + url + "');");
	list.push("INSERT INTO positions (url_id, position_n, condition_id, date_create) " +
		"SELECT URL_ID," +
		position + ", " +
		"( SELECT CONDITION_ID FROM search WHERE SEARCH_ID = " + search_id + "), '" +
		date_create.toISOString() +
		"' FROM urls WHERE url = '" + url + "' LIMIT 1");
	return express.execute_list(list)
}
PgPositions.prototype.get_positions_by_url = function (url) {

	var date_create = new Date();
	// create a Url
	var db
	express = new PgExpressions()
	list = []
	list.push("SELECT" +
				"U.URL, " +
				"U.URL_ID, " +
				"C.CONDITION_QUERY, " +
				"C.REGION, " +
				"SE.SENGINE_NAME " +
			"FROM " +
				"urls U " +
				"JOIN positions POS " +
					"ON U.URL_ID = POS.URL_ID " +
				"JOIN condition C " +
					"ON POS.CONDITION_ID = C.CONDITION_ID " +
				"JOIN sengine SE " +
					"ON C.SENGINE_ID = SE.SENGINE_ID " +
			" WHERE url = '" + url + "');");
	return express.execute_list(list)
}

module.exports = PgPositions;
