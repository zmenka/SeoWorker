
var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgRegions() {

};

PgRegions.prototype.list = function () {
    return PG.query("SELECT * FROM regions;",
        [])
        .then( function (res) {
            //console.log('PgRegions.prototype.list')
            return res.rows;
        })
        .catch(function (err) {
            throw  err;
        })
}

module.exports = PgRegions;
