var pgp = require('pg-promise')
var Config = require('../../server/config');
var promise = require('bluebird');

var options = {
    promiseLib: promise
};

module.exports = pgp(Config.postgres);