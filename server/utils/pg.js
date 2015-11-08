var Config = require('../../server/config');
var promise = require('./promise');
var Logger = require('./logger');

var options = {
    //promiseLib: promise,
    query: function (e) {
        Logger.INFO(e.query);
    },
    error: function (err, e) {
        /* do some of your own processing, if needed */
    }
};

var pgp = require('pg-promise')(options)

var db = pgp(Config.postgres);


// логируется время выполнения, возвращает промис с массивом данных
function logQuery(queryText, valuesArray) {
    return db.task(function (t) {
        return t.query(queryText, valuesArray)
    })
        .catch(function (err) {
            throw new Error(err)
        })
}

//логируется время выполнения, возвращает промис с объектом
function logQueryOne(queryText, valuesArray) {
    return db.task(function (t) {
        return t.one(queryText, valuesArray)
    })
        .catch(function (err) {
            throw new Error(err)
        })
}

//логируется время выполнения, возвращает промис с объектом, expects 1 or 0 rows
function logQueryOneOrNone(queryText, valuesArray) {
    return db.task(function (t) {
        return t.oneOrNone(queryText, valuesArray)
    })
        .catch(function (err) {
            throw new Error(err)
        })
}


// логируется время выполнения, все запросы ПАРАЛЛЕЛЬНО, не последовательно
// queryList : {queryText: string, valuesArray: any[]} []
function logQueryListAsync(queryList) {
    return db.task(function (t) {
        var queries = []
        for (var key in queryList) {
            queries.push(this.query(queryList[key].queryText, queryList[key].valuesArray));
        }
        return this.batch(queries);
    })
        .catch(function (err) {
            throw new Error(err)
        })
}

// логируется время выполнения, все запросы последовательно
// queryList : {queryText: string, valuesArray: any[]} []
function logQueryListSync(queryList) {
    function source(index, data, delay) {
        if (!queryList[index])
            return
        return this.query(queryList[index].queryText, queryList[index].valuesArray)
    }

    return db.task(function (t) {
        return this.sequence(source);
    })
        .catch(function (err) {
            throw new Error(err)
        })
}

// выполняет транзакцию, все запросы ПАРАЛЛЕЛЬНО, не последовательно
// queryList : {queryText: string, valuesArray: any[]} []
function transactionAsync(queryList) {
    return db.tx(function (t) {
        var queries = []
        for (var key in queryList) {
            queries.push(this.query(queryList[key].queryText, queryList[key].valuesArray));
        }
        return this.batch(queries);
    })
        .catch(function (err) {
            throw new Error(err)
        })
}

// выполняет транзакцию, все запросы ПОСЛЕДОВАТЕЛЬНО
// queryList : {queryText: string, valuesArray: any[], preFunc: function(preData){}} []
function transactionSync(queryList) {
    function source(index, data, delay) {
        if (!queryList[index])
            return
        return this.query(queryList[index].queryText, queryList[index].valuesArray)
    }

    return db.tx(function (t) {
        return this.sequence(source);
    })
        .catch(function (err) {
            console.log(err)
            throw new Error(err)
        })
}



module.exports = {
    logQuery: logQuery,
    logQueryOne: logQueryOne,
    logQueryOneOrNone: logQueryOneOrNone,
    logQueryListAsync: logQueryListAsync,
    logQueryListSync: logQueryListSync,
    transactionAsync: transactionAsync,
    transactionSync: transactionSync,
    db: db

};