var PG = require('../../utils/pg');
var fs = require('fs');
var path = require('path');

var PgManager = {};

PgManager.getCookieTaskUpdateTime = function () {
    return PG.logQueryOne("SELECT DATE_UPDATE FROM manager WHERE MANAGER_ID=1;",
        []
    )
        .then(function (res) {
            return res.date_update
        })
}

PgManager.updateCookieTaskUpdateTime = function (date) {
    return PG.logQuery("UPDATE manager SET DATE_UPDATE= $1 WHERE manager_id=1;",
        [date])
        .then(function (res) {
            return;
        })
}

module.exports = PgManager;
