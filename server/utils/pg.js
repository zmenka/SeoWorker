var Config = require('../../server/config');
var promise = require('./promise');

var options = {
    promiseLib: promise,
};

var pgp = require('pg-promise')(options)

var db = pgp(Config.postgres);

var monitor = require("pg-monitor");
monitor.log = function(msg, info){
    //save logs
    //console.log( new Date(),  msg, info)
};

var color = require("cli-color"); // must use this color library;

var myTheme = {
        time: color.bgWhite.black,
        value: color.white,
        cn: color.yellow,
        tx: color.cyan,
        paramTitle: color.magenta,
        errorTitle: color.redBright,
        query: color.magenta,
        special: color.green,
        error: color.red
    }
monitor.setTheme(myTheme);
monitor.attach(options);

//возвращает промис с массивом данных
function query (queryText, valuesArray) {
    return db.query(queryText, valuesArray)
}

//возвращает промис с объектом. Если не находится объекта или больше 1, то throw err
function queryOne (queryText, valuesArray) {
    return db.one(queryText, valuesArray)
}

//вызывает функцию/процедуру, возвращает промис с массивом данных
function func (queryText, valuesArray) {
    return db.func(queryText, valuesArray)
}

// логируется время выполнения, возвращает промис с массивом данных
function logQuery (queryText, valuesArray) {
    return db.task(function (t) {
        return t.query(queryText, valuesArray)
    })
}

//логируется время выполнения, возвращает промис с объектом
function logQueryOne (queryText, valuesArray) {
    return db.task(function (t) {
        return t.one(queryText, valuesArray)
    })
}

//логируется время выполнения, возвращает промис с объектом, expects 1 or 0 rows
function logQueryOneOrNone (queryText, valuesArray) {
    return db.task(function (t) {
        return t.oneOrNone(queryText, valuesArray)
    })
}

// логируется время выполнения, все запросы ПАРАЛЛЕЛЬНО, не последовательно
// queryList : {queryText: string, valuesArray: any[]} []
function logQueryListAsync (queryList) {
    return db.task(function (t) {
        var queries = []
        for (var key in queryList) {
            queries.push(this.query(queryList[key].queryText, queryList[key].valuesArray));
        }
        return this.batch(queries);
    })
}

// логируется время выполнения, все запросы последовательно
// queryList : {queryText: string, valuesArray: any[]} []
function logQueryListSync (queryList) {
    function source(index, data, delay) {
        if (!queryList[index])
            return
        return this.query(queryList[index].queryText, queryList[index].valuesArray)
    }
    return db.task(function (t) {
        return this.sequence(source, undefined, 0 , true);
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
}

// выполняет транзакцию, все запросы ПОСЛЕДОВАТЕЛЬНО
// queryList : {queryText: string, valuesArray: any[]} []
function transactionSync(queryList) {
    function source(index, data, delay) {
        return this.query(queryList[index].queryText, queryList[index].valuesArray)
    }
    return db.tx(function (t) {
        return this.sequence(source, undefined, 0 , true);
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

    query : query,
    queryOne : queryOne,
    func : func,
};