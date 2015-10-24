
var PG = require('../../utils/pg');

var PgSengines = {};

PgSengines.list = function () {
    return PG.logQuery("SELECT * FROM sengines;")
};

module.exports = PgSengines;
