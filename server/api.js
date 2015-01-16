var PgUsurls = require("./db/postgres/pg_usurls");
var PgTasks = require("./db/postgres/pg_tasks");
var PgSearch = require("./db/postgres/pg_search");
var PgSengines = require("./db/postgres/pg_sengines");
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

        if (!req.user || !req.user.user_id) {
            errback("Нет зарегистрированного пользователя!", res);
            return;
        }

        new PgUsurls().listWithTasks(req.user.user_id)
            .then(function (sites) {
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.get('/api/sengines', function (req, res, next) {
        console.log('/api/sengines');

        new PgSengines().list()
            .then(function (sites) {
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.post('/api/create_site', function (req, res, next) {
        console.log('/api/create_site', req.body);

        if (!req.body.url) {
            errback("не найден параметр url ", res);
            return;
        }

        if (!req.user || !req.user.user_id) {
            errback("Нет зарегистрированного пользователя!", res);
            return;
        }

        new PgUsurls().insertWithUrl(req.body.url, req.user.user_id)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.post('/api/create_task', function (req, res, next) {
        console.log('/api/create_site', req.body);

        if (!req.body.usurl_id || !req.body.condition_query || !req.body.sengine_id
            || !req.body.region || !req.body.size_search) {
            errback("не найдены параметры! ", res);
            return;
        }

        new PgTasks().insertWithCondition(req.body.usurl_id, req.body.condition_query, req.body.sengine_id,
            req.body.region, req.body.size_search)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.post('/api/save_task', function (req, res, next) {
        console.log('/api/save_task', req.body);
        res.statusCode = 200;

        if (!req.body.task_id || !req.body.condition_query || !req.body.sengine_id || !req.body.region || !req.body.size_search) {
            errback("не найдены параметры task_id или condition_query or sengine_id", res);
            return;
        }

        new PgTasks().updateWithCondition(req.body.task_id, req.body.condition_query, req.body.sengine_id,
                req.body.region, req.body.size_search)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });
    var serverFree = true;
    app.post('/api/calc_params', function (req, res, next) {
        console.log('/api/calc_params', req.body);
        if (!serverFree) {
            errback("Сервер занят, попробуйте позже.", res);
            return;
        }
        if (!req.body.condition_id) {
            errback("Не найден параметр condition_id.", res);
            return;
        }

        if (!req.user || !req.user.user_id) {
            errback("Нет зарегистрированного пользователя!", res);
            return;
        }
        serverFree = false;
        return new Core().calcParams(req.body.condition_id, req.body.captcha, req.headers, req.user.user_id)
            .then(function () {
                return new Core().calcParamsByUrl(req.body.url, req.body.condition_id)
            })
            .then(function () {
                callback("ok", res);
                serverFree = true
            })
            .catch(function (err) {
                serverFree = true
                errback(err, res);
            })
        serverFree = true
    });

    app.post('/api/get_params', function (req, res, next) {
        console.log('/api/get_params', req.body);
        if (!req.body.condition_id) {
            errback("не найдены параметры condition_id", res);
            return;
        }
        var params;
        new PgSearch().listWithParams(req.body.condition_id)
            .then(function (params_res) {
                params = params_res;
                return new PgSearch().siteWithParams(req.body.url_id, req.body.condition_id)
                return null
            })
            .then(function (site_params) {
                callback({all_params: params, site_params: site_params}, res);

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

    app.post('/api/login', function (req, res, next) {
            passport.authenticate('login', function (err, user, info) {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    return errback({ message: info.message }, res);
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return callback({ message: info.message }, res);
                });
            })(req, res, next);
        }
    );

    app.get('/api/logout', function (req, res) {
        console.log('/api/logout');
        req.logout();

        return callback("logout ok", res);
    });

    app.post('/api/register', function (req, res, next) {
        passport.authenticate('register', function (err, user, info) {
            if (err) {
                return next(err)
            }
            if (!user) {
                return errback({ message: info.message }, res);
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return callback({ message: info.message }, res);
            });
        })(req, res, next);
    });

    app.get('/api/check_auth', function (req, res, next) {
        // if user is authenticated in the session, carry on
        console.log('/api/check_auth', req.isAuthenticated())
        callback(req.isAuthenticated(), res);
    });

}
