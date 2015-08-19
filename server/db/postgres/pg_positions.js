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
    var express = new PgExpressions()
    var list = []
    list.push("INSERT INTO urls (url, date_create) " +
    		"SELECT '" + url + "', '" + date_create.toISOString() + "' " +
    		"WHERE NOT EXISTS (SELECT 1 FROM urls WHERE url = '" + url + "');");
    list.push("INSERT INTO positions (url_id,position_n,search_id, date_create) " +
			"SELECT URL_ID," + 
			        position + ", " + 
			        search_id + ", '" + 
			        date_create.toISOString() + 
			"' FROM urls WHERE url = '" + url + "' LIMIT 1");
    return express.execute_list(list)

}

module.exports = PgPositions;
