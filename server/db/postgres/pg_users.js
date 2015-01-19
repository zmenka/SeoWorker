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
var bcrypt = require('bcrypt-nodejs');

function PgUsers() {

};

// generating a hash
PgUsers.prototype.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
PgUsers.prototype.validPassword = function (password, savedPassword) {
    return bcrypt.compareSync(password, savedPassword);
};

PgUsers.prototype.insert = function (user_login, user_password, role_id, user_fname, user_iname, user_oname, user_email, user_phone) {

    var date_create = new Date();
    var password = this.generateHash(user_password);

    var db;

    return this.getByLogin(user_login)
        .then(function (users) {
            if (users.length > 0) {
                throw("Такой пользователь уже существует!")
                return;
            }
            return new PG()
        })
        .then(function (db_res) {
            db = db_res
            return db.transact(
                "INSERT INTO users (user_login, \
                      user_password, \
                      role_id,\
                      user_fname,\
                      user_iname,\
                      user_oname,\
                      user_email,\
                      user_phone,\
                      date_create) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);",
                [user_login,
                    password,
                    role_id,
                    user_fname,
                    user_iname,
                    user_oname,
                    user_email,
                    user_phone,
                    date_create]
            )
        })
        .then(function (res) {
            return db.transact(
                "SELECT currval(pg_get_serial_sequence('users','user_id'))",
                [], true
            )
        })
        .then(function (res) {
            console.log('PgUsers.prototype.insert');
            return res.rows[0].currval;
        })
        .catch(function (err) {
            throw 'PgUsers.prototype.insert ' + err
        })
}

PgUsers.prototype.disabledUser = function (user_login, disabled) {

    var db;

    return this.getByLogin(user_login)
        .then(function (users) {
            if (users.length != 1) {
                throw("Нет такого пользователя!")
                return;
            }
            return new PG()
        })
        .then(function (db_res) {
            db = db_res
            return db.transact(
                "UPDATE users SET DISABLED = $1 " +
                    "WHERE USER_LOGIN=$2;",
                [user_login, disabled], true
            )
        })
//        .then(function (res) {
//            return db.transact(
//                "SELECT currval(pg_get_serial_sequence('users','user_id'))",
//                [], true
//            )
//        })
        .then(function (res) {
            console.log('PgUsers.prototype.disabledUser');
            return res;
        })
        .catch(function (err) {
            throw 'PgUsers.prototype.disabledUser ' + err
        })
}

PgUsers.prototype.list = function () {
    return PG.query("SELECT * FROM users ORDER BY date_create desc;",
        [])
        .then(function (res) {
            console.log("PgUsers.prototype.list")
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgUsers.prototype.list' + err;
            console.log(err);
        })
}

PgUsers.prototype.get = function (id) {
    return PG.query("SELECT * FROM users WHERE user_id = $1;",
        [id])
        .then(function (res) {
            console.log("PgUsers.prototype.get")
            return res.rows[0];
        })
        .catch(function (err) {
            throw 'PgUsers.prototype.get' + err;
            console.log(err);
        })
}

PgUsers.prototype.getByLogin = function (login) {
    return PG.query("SELECT * FROM users WHERE user_login = $1;",
        [login])
        .then(function (res) {
            console.log("PgUsers.prototype.getByLogin")
            return res.rows;
        })
        .catch(function (err) {
            throw 'PgUsers.prototype.getByLogin' + err;
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

PgUsers.prototype.updateCookies = function (id, cookies) {
    return PG.query("UPDATE users SET cookies = $1 WHERE user_id = $2;",
        [cookies, id])
        .then(function (res) {
            console.log("updateCookies", cookies)
            return;
        })
        .catch(function (err) {
            throw 'PgUsers.prototype.get' + err;
        })
}

module.exports = PgUsers;
