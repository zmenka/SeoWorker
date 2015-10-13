
var PG = require('../../utils/pg');
var fs = require('fs');
var path = require('path');

var PgRegions = {};

PgRegions.list = function () {
    return PG.logQuery("SELECT * FROM regions;")
}

module.exports = PgRegions;
