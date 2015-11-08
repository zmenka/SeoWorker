
var PG = require('../../utils/pg');

var PgConderrs = {};

PgConderrs.insert = function (condition_id, name, message, stack) {
    var date_create = new Date();
    return PG.logQuery(
        "INSERT INTO conderrs (ERROR_NAME, ERROR_MESSAGE, ERROR_STACK, CONDITION_ID, DATE_CREATE) VALUES ($1, $2, $3, $4, $5);",
        [name, message, stack, condition_id, date_create]
    )
};

module.exports = PgConderrs;
