var PG = require('../utils/pg');
var bcrypt = require('bcrypt-nodejs');
var format = require('../utils/format');

function PgUsers() {};

// generating a hash
PgUsers.prototype.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
PgUsers.prototype.validPassword = function (password, savedPassword) {
    return bcrypt.compareSync(password, savedPassword);
};

PgUsers.prototype.get = function (id) {
    return PG.one("SELECT * FROM users WHERE user_id = $1;", id)
}

PgUsers.prototype.getByLogin = function (login) {
    return PG.one("SELECT * FROM users WHERE user_login = $1;",
        login)
}

module.exports = PgUsers;
