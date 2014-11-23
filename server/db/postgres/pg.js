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
    this.client = new Client(Config.postgres);
    this.client.connect();
    console.log("connection to pg created");
    this.client.query('BEGIN', function (err, result) {
        if (err) {
            _this.rollback();
            deferred.reject(err);
            return;
        }
        deferred.resolve(_this);

    });
    return deferred.promise;
}
PG.prototype.rollback = function () {
    var _this = this;
    //terminating a client connection will
    //automatically rollback any uncommitted transactions
    //so while it's not technically mandatory to call
    //ROLLBACK it is cleaner and more correct
    this.client.query('ROLLBACK', function () {
        console.log('ROLLBACK')
        _this.client.end();
    });
};

PG.prototype.transact = function (query, params, endTransaction) {
    var _this = this;
    var deferred = Q.defer();
    endTransaction = endTransaction || false;
    this.client.query(query, params, function (err, result) {
        if (err) {
            _this.rollback();
            deferred.reject(err);
            return;
        }

        if (endTransaction) {
            //disconnect after successful commit
            _this.client.query('COMMIT', function (res) {
                //console.log("results of commit:", res);
                console.log("call callback after commit");
                _this.client.end.bind(_this.client);
                deferred.resolve(result);
            });
        } else {
            console.log("call callback");
            deferred.resolve(result);
        }

    });
    return deferred.promise;
}

PG.query = function PG(query, params) {
    var deferred = Q.defer();
    var client = new pg.Client(Config.postgres);
    client.connect(function(err) {
        if(err) {
            deferred.reject('could not connect to postgres', err);
            return;
        }
        client.query(query, params, function(err, result) {
            if(err) {
                deferred.reject(err);
                return;
            }
            client.end();
            deferred.resolve(result);
        });
    });
    return deferred.promise;
}

module.exports = PG;