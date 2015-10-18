var PG = require('./pg');
var fs = require('fs');
var path = require('path');

var PgManager = {};

PgManager.getCookieTaskUpdateTime = function () {
    return PG.query("SELECT DATE_UPDATE FROM manager WHERE MANAGER_ID=1;",
        []
    )
        .then(function (res) {
            if (res.rows && res.rows.length == 1) {
                return res.rows[0]["date_update"]
            } else {
                return null
            }
        })
        .catch(function (err) {
            throw err
        })
}

PgManager.updateCookieTaskUpdateTime = function (date) {
    return PG.query("UPDATE manager SET DATE_UPDATE= '" + date.toISOString() + "' WHERE manager_id=1;",
        [])
        .then(function (res) {
            return;
        })
}

module.exports = PgManager;
