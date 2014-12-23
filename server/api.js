var PgUsurls = require("./db/postgres/pg_usurls");
var PgTasks = require("./db/postgres/pg_tasks");
var PgSearch = require("./db/postgres/pg_search");

var Core = require("./core");

var BunSearcher = require("./bun_searcher");
var callback = function (data, response) {
    response.json(data);
};

var errback = function (err, response) {
    response.statusCode = 440;
    response.send(err);
};

module.exports = function Api(app, passport) {

// routes ======================================================================

// api ---------------------------------------------------------------------

// get all sites and tasks
    app.get('/api/user_sites_and_tasks', function (req, res, next) {
        console.log('/api/user_sites_and_tasks');

        new PgUsurls().listWithTasks()
            .then(function (sites) {
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.post('/api/create_site', function (req, res, next) {
        console.log('/api/create_site', req.body);
        res.statusCode = 200;

        if (!req.body.url) {
            errback("не найден параметр url ", res);
            return;
        }

        new PgUsurls().insertWithUrl(req.body.url)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.post('/api/create_task', function (req, res, next) {
        console.log('/api/create_site', req.body);
        res.statusCode = 200;

        if (!req.body.usurl_id || !req.body.condition_query) {
            errback("не найдены параметры usurl_id или condition_query", res);
            return;
        }

        new PgTasks().insertWithCondition(req.body.usurl_id, req.body.condition_query, 2)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.post('/api/calc_params', function (req, res, next) {
        console.log('/api/calc_params', req.body);
        if (!req.body.condition_id) {
            errback("не найдены параметры condition_id ", res);
            return;
        }
        new Core().calcParams(req.body.condition_id,req.body.captcha, req.headers, 1)
            .then(function (params) {
                callback(params, res);

            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.post('/api/get_params', function (req, res, next) {
        console.log('/api/get_params', req.body);
        if (!req.body.condition_id) {
            errback("не найдены параметры condition_id", res);
            return;
        }
        new PgSearch().listWithParams(req.body.condition_id)
            .then(function (params) {
                callback(params, res);

            })
            .catch(function (err) {
                errback(err, res);
            })

    });


    app.post('/api/captcha', function (req, res, next) {
        console.log('/api/captcha', req.body);
        //console.log('headers', JSON.stringify(req.headers))
        try {
            new BunSearcher().test(req.body, req.headers, function (result) {
                callback(result, res)

            }, function (err) {
                errback(err, res);
            })
        } catch (e) {
            errback(e, res);
        }
    });

    app.post('/api/login', function(req, res, next) {
            passport.authenticate('login', function(err, user, info) {
                if (err) { return next(err) }
                if (!user) {
                    return errback({ message: info.message }, res);
                }
                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    return callback({ message: info.message }, res);
                });
            })(req, res, next);
        }
    );

    app.get('/api/logout', function(req, res){
        console.log('/api/logout');
        req.logout();

        return callback("logout ok", res);
    });

    app.post('/api/register', function(req, res, next) {
        passport.authenticate('register', function(err, user, info) {
            if (err) { return next(err) }
            if (!user) {
                return errback({ message: info.message }, res);
            }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return callback({ message: info.message }, res);
            });
        })(req, res, next);
    });

    app.get('/api/check_auth', function(req, res, next) {
        // if user is authenticated in the session, carry on
        console.log('/api/check_auth', req.isAuthenticated())
        callback(req.isAuthenticated(), res);
    });

}
