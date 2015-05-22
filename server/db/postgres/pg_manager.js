
var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgManager() {

};

PgManager.prototype.getCookieTaskUpdateTime = function () {
    return PG.query("SELECT DATE_UPDATE FROM manager WHERE MANAGER_ID=1;",
        []
    )
        .then(function (res) {
            console.log("PgManager.prototype.getCookieTaskUpdateTime")
            if (res.rows && res.rows.length == 1){
                return res.rows[0]["date_update"]
            } else {
                return null
            }
        })
        .catch(function (err) {
            throw 'PgManager.prototype.getCookieTaskUpdateTime err ' + err;

        })
}

PgManager.prototype.updateCookieTaskUpdateTime = function (date) {
    return PG.query("UPDATE manager SET DATE_UPDATE= '" +  date.toISOString() + "' WHERE manager_id=1;",
        [])
        .then(function (res) {
            console.log("PgManager.prototype.updateCookieTaskUpdateTime")
            return;
        })
        .catch(function (err) {
            console.log(err);
            throw 'PgManager.prototype.updateCookieTaskUpdateTime err ' + err;

        })
}

module.exports = PgManager;
