/**
 * Created by zmenka on 01.11.14.
 */
// get a pg client from the connection pool
var pg = require('pg');
var Q = require('q');
var Config = require('../../config');
var Client = require('pg').Client;

function PG() {
    var deferred = Q.defer();
    var _this = this;
    _this.client = new Client(Config.postgres);
    _this.client.connect();
    //console.log("connection to pg created");
    _this.client.query('BEGIN', function (err, result) {
        if (err) {
            _this.rollback(_this.client);
            deferred.reject(err);
            return;
        }
        deferred.resolve(_this);

    });
    return deferred.promise;
}
PG.prototype.rollback = function (client) {
    //terminating a client connection will
    //automatically rollback any uncommitted transactions
    //so while it's not technically mandatory to call
    //ROLLBACK it is cleaner and more correct
    client.query('ROLLBACK', function () {
        client.end();
    });
};

PG.prototype.transact = function (query, params, endTransaction) {
    var _this = this;
    var date = new Date()
    var deferred = Q.defer();
    endTransaction = endTransaction || false;
    _this.client.query(query, params, function (err, result) {
        if (err) {
            _this.rollback(_this.client);
            deferred.reject(err);
            return;
        }

        if (endTransaction) {
            //disconnect after successful commit
            _this.client.query('COMMIT', function (res) {
                //console.log("results of commit:", res);
                //console.log("call callback after commit");
                _this.client.end.bind(_this.client);
                console.log(-date.getTime()+(new Date().getTime()))
                deferred.resolve(result);
            });
        } else {
            //console.log(-date.getTime()+(new Date().getTime()))
            //console.log("call callback");
            deferred.resolve(result);
        }

    });
    return deferred.promise;
}

PG.query = function PG(query, params) {
    var deferred = Q.defer();
    var date = new Date();
    pg.connect(Config.postgres, function (err, client, done) {
        var handleError = function (err1) {
            // no error occurred, continue with the request
            if (!err1) {
                return false;
            }

            // An error occurred, remove the client from the connection pool.
            // A truthy value passed to done will remove the connection from the pool
            // instead of simply returning it to be reused.
            // In this case, if we have successfully received a client (truthy)
            // then it will be removed from the pool.
            done(client);
            deferred.reject('postgres query error ', err1);
            return true;
        };

        if (handleError(err)) {
            return;
        }

        client.query(query, params, function (err, result) {
            if (handleError(err)) {
                return;
            }
            done();
            console.log(-date.getTime() + (new Date().getTime()))
            deferred.resolve(result);
        });
    });
    return deferred.promise;
}

module.exports = PG;