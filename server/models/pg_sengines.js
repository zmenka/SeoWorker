
var PG = require('../utils/pg');
var fs = require('fs');
var path = require('path');

function PgSengines() {

};

PgSengines.prototype.list = function () {
    return PG.query("SELECT * FROM sengines;")
}

module.exports = PgSengines;
