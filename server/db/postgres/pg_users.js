/**
 * Created by bryazginnn on 22.11.14.
 * 
 *  
 *  var PgUsers = require("./server/db/postgres/pg_users");
 *  var users = new PgUsers();
 * 
 *  //вставить строку в таблицу users
 *  users.insert (
 *      <user_login>,
 *      <user_password>,
 *      <role_id>,
 *      <user_fname>,
 *      <user_iname>,
 *      <user_oname>,
 *      <user_email>,
 *      <user_phone>,
 *      <callback>,
 *      <errback>
 *  ) 
 *    returns <new user_id>
 * 
 *  //получить все строки из users
 *  users.list (<callback>,<errback>) 
 *    returns [{user_id , user_login , ...}, ...]
 * 
 *  //получить строку из users с помощью user_id
 *  users.get (<user_id>,<callback>,<errback>) 
 *    returns {user_id , user_login , ...}
 * 
 *  //получить строки из users с помощью user_login 
 *  users.findByLogin (<url>,<callback>,<errback>) 
 *    returns [{user_id , user_login , ...}, ...]
 * 
 *  //получить строки из users с помощью user_email 
 *  users.findByEmail (<url>,<callback>,<errback>) 
 *    returns [{user_id , user_login , ...}, ...]
 * 
 *  //получить строки из users с помощью user_phone 
 *  users.findByPhone (<url>,<callback>,<errback>) 
 *    returns [{user_id , user_login , ...}, ...]
 */

var PG = require('./pg');
var fs = require('fs');
var path = require('path');

function PgUsers() {

};

 *      <user_login>,
 *      <user_password>,
 *      <role_id>,
 *      <user_fname>,
 *      <user_iname>,
 *      <user_oname>,
 *      <user_email>,
 *      <user_phone>,
PgUsers.prototype.insert = function (
    user_login, 
    user_password, 
    role_id,
    user_fname,
    user_iname,
    user_oname,
    user_email,
    user_phone,
    callback, 
    errback) {

    var date_create = new Date();
    // create a Url
    var db = new PG(
        function(){
            db.transact(
                "INSERT INTO users (user_login, \
                      user_password, \
                      role_id,\
                      user_fname,\
                      user_iname,\
                      user_oname,\
                      user_email,\
                      user_phone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);",
                [user_login, 
                    user_password, 
                    role_id,
                    user_fname,
                    user_iname,
                    user_oname,
                    user_email,
                    user_phone],
                function (res) {
                    db.transact(
                        "SELECT currval(pg_get_serial_sequence('users','user_id'))",
                        [],
                        function(res){
                            console.log("user saved");
                            callback(res.rows[0].currval);
                        },
                        function(err){
                            console.log('PgUsers.prototype.insert 1');
                            console.log(err);
                        },
                        true)
                },
                function (err) {
                    console.log('PgUsers.prototype.insert 2');
                    console.log(err); 
                }
            );
        },
        function(err){
            console.log('PgUsers.prototype.insert 3');
            console.log(err);
        }
    );
}

PgUsers.prototype.list = function (callback, errback) {
    PG.query("SELECT * FROM users ORDER BY date_create desc;",
        [],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsers.prototype.list');
            console.log(err);
        })
}

PgUsers.prototype.get = function (id, callback, errback) {
    PG.query("SELECT * FROM users WHERE user_id = $1;",
        [id],
        function (res) {
            callback(res.rows[0]);
        },
        function (err) {
            console.log('PgUsers.prototype.get');
            console.log(err);
        })
}

PgUsers.prototype.findByLogin = function (val, callback, errback) {
    PG.query("SELECT * FROM users WHERE user_login = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsers.prototype.findByLogin');
            console.log(err);
        })
}
PgUsers.prototype.findByEmail = function (val, callback, errback) {
    PG.query("SELECT * FROM users WHERE user_email = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsers.prototype.findByEmail');
            console.log(err);
        })
}
PgUsers.prototype.findByPhone = function (val, callback, errback) {
    PG.query("SELECT * FROM users WHERE user_phone = $1;",
        [val],
        function (res) {
            callback(res.rows);
        },
        function (err) {
            console.log('PgUsers.prototype.findByPhone');
            console.log(err);
        })
}

module.exports = PgUsers;
