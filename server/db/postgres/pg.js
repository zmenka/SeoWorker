/**
 * Created by zmenka on 01.11.14.
 */
// get a pg client from the connection pool
var pg = require('pg');
var Config = require('../../config');
var Client = require('pg').Client;

function PG(callback, errback) {
    var _this = this;
    this.client = new Client(Config.postgres);
    this.client.connect();
    console.log("connection to pg created");
    this.client.query('BEGIN', function (err, result) {
        if (err) return _this.rollback(errback, err);
        callback();
    });

}
PG.prototype.rollback = function (errback, error) {
    var _this = this;
    //terminating a client connection will
    //automatically rollback any uncommitted transactions
    //so while it's not technically mandatory to call
    //ROLLBACK it is cleaner and more correct
    this.client.query('ROLLBACK', function () {
        _this.client.end();
        errback(error)
    });
};

PG.prototype.transact = function (query, params, callback, errback, endTransaction) {
    var _this = this;
    endTransaction = endTransaction || false;
    this.client.query(query, params, function (err, result) {
        if (err) return _this.rollback(errback, err);

        if (endTransaction) {
            //disconnect after successful commit
            _this.client.query('COMMIT', function (res) {
                //console.log("results of commit:", res);
                console.log("call callback after commit");
                _this.client.end.bind(_this.client);
                callback(result);
            });
        } else {
            console.log("call callback");
            callback(result);
        }

    });
}

PG.query = function PG(query, params, callback, errback) {
    var client = new pg.Client(Config.postgres);
    client.connect(function(err) {
        if(err) {
            errback('could not connect to postgres', err);
        }
        client.query(query, params, function(err, result) {
            if(err) {
                return errback(err);
            }
            callback(result);
            client.end();
        });
    });

}

module.exports = PG;