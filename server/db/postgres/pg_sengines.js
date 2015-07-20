/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgSengines = require("./server/db/postgres/pg_sengines");
 *  var sengines = new PgSengines();
 * 
 *  //получить все строки из sengines
 *  sengines.list (<callback>,<errback>) 
 *    returns [{sengines_id , sengines_name , ...}, ...]
 * 
 *  //получить строку из sengines с помощью sengines_id
 *  sengines.get (<sengines_id>,<callback>,<errback>) 
 *    returns {sengines_id , sengines_name , ...}
 * 
 *  //получить строки из sengines с помощью sengines_name
 *  sengines.find (<sengines_name>,<callback>,<errback>) 
 *    returns [{sengines_id , sengines_name , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgSengines() {

};

PgSengines.prototype.list = function () {
    return PG.query("SELECT * FROM sengines;",
        [])
        .then( function (res) {
            //console.log('PgSengines.prototype.list')
            return res.rows;
        })
        .catch(function (err) {
            throw  err;
        })
}

PgSengines.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM sengines WHERE sengine_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgSengines.prototype.get');
            console.log(err);
        })
}

PgSengines.prototype.find = function (sengine_name, callback, errback) {
    PG.query("SELECT * FROM sengines WHERE sengine_name = $1;",
        [sengine_name],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgSengines.prototype.find');
            console.log(err);
        })
}

module.exports = PgSengines;
