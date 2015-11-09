//PG
var tPgConditions = require('./server/pg/conditions');
//API
var api = require('../utils/api')
var tApiConditions = require('./server/api/conditions');
var tApiCalc = require('./server/api/calc');
var tApiUsers = require('./server/api/users');

describe('SERVER', function () {

    describe('PG', function () {

        describe('CONDITIONS', function () {
            it('getNext', tPgConditions.getNext);
        });
    });

    describe('API', function () {
        before(api.before);

        describe('CONDITIONS', function () {
            it('reset', tApiConditions.reset)
        });

        describe('CALC', function () {
            //долгий тест
            it.only('updateCondition', tApiCalc.updateCondition)
        });

        describe('USERS', function () {
            //долгий тест
            it('getUsers', tApiUsers.getUsers)
        });
    });
});
