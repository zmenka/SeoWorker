var PgUsers = require("./db/postgres/pg_users");
var PgUsurls = require("./db/postgres/pg_usurls");
var PgTasks = require("./db/postgres/pg_tasks");
var PgSearch = require("./db/postgres/pg_search");
var PgSengines = require("./db/postgres/pg_sengines");
var PgParams = require("./db/postgres/pg_params");
var PgHtmls = require("./db/postgres/pg_htmls");
var PgCorridor = require("./db/postgres/pg_corridor");
var SeoFormat = require("./SeoFormat");
var Diagram = require("./Diagram");
var Core = require("./core");

var callback = function (data, response) {
    response.json(data);
};

var errback = function (err, response, userMsg) {
    var msg = (err && err.stack) ? err.stack : (err ? err : userMsg)
    console.log(msg);
    response.statusCode = 440;
    //var userMsgResult = userMsg ? userMsg : (err && err.message ? err.message : (err ? err : ''));
    response.send(userMsg);
};

module.exports = function Api(app, passport) {

// routes ======================================================================

// api ---------------------------------------------------------------------

    app.get('/api/users', function (req, res, next) {
        console.log('/api/users');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id!=1){
            errback(null, res,"Вы не админ.");
            return;
        }

        return new PgUsers().listWithSitesCount()
            .then(function (users) {
                callback(users, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.get('/api/user', function (req, res, next) {
        console.log('/api/user',  req.query);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id!=1){
            errback(null, res, "Вы не админ.");
            return;
        }

        if (!req.query.user_id) {
            errback(null, res,"Не найден ид пользователя.");
            return;
        }

        return new PgUsers().get(req.query.user_id)
            .then(function (user) {
                callback(user, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.post('/api/edit_user', function (req, res, next) {
        console.log('/api/edit_user', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id!=1){
            errback(null, res,"Вы не админ.");
            return;
        }

        if (!req.body.user_id) {
            errback(null, res, "Не найден параметр user_id ");
            return;
        }

        return new PgUsers().edit(req.body.user_id, req.body.new_login, req.body.new_pasw, req.body.disabled, req.body.disabled_message)
            .then(function (user) {
                callback(user, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

// get all sites and tasks
    app.get('/api/user_sites_and_tasks', function (req, res, next) {
        console.log('/api/user_sites_and_tasks');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.query.user_id != req.user.user_id && req.user.role_id!=1) {
            errback(null, res,"Нет доступа.");
            return;
        }

        if (!req.query.user_id) {
            errback(null, res,"Не найден параметр user_id ");
            return;
        }

        return new PgUsurls().listWithTasks(req.query.user_id)
            .then(function (dirty_sites) {
                var SF = new SeoFormat();
                var sites = SF.createSiteTree(dirty_sites);
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.get('/api/sengines', function (req, res, next) {
        console.log('/api/sengines');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        return new PgSengines().list()
            .then(function (sites) {
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.post('/api/create_site', function (req, res, next) {
        console.log('/api/create_site', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res,"Вы не зарегистрировались.");
            return;
        }

        if (!req.body.url) {
            errback(null, res, "не найден параметр url ");
            return;
        }

        if (!req.body.user_id) {
            errback(null, res, "не найден параметр url ");
            return;
        }

        return new PgUsurls().insertWithUrl(req.body.url, req.body.user_id)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.post('/api/create_task', function (req, res, next) {
        console.log('/api/create_site', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.usurl_id || !req.body.condition_query || !req.body.sengine_id
            || !req.body.region || !req.body.size_search) {
            errback(null, res, "не найдены параметры! ");
            return;
        }

        return new PgTasks().insertWithCondition(req.body.usurl_id, req.body.condition_query, req.body.sengine_id,
            req.body.region, req.body.size_search)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

//    app.post('/api/save_task', function (req, res, next) {
//        console.log('/api/save_task', req.body);
//        res.statusCode = 200;
//
//        if (!req.body.task_id || !req.body.condition_query || !req.body.sengine_id || !req.body.region || !req.body.size_search) {
//            errback("не найдены параметры task_id или condition_query or sengine_id", res);
//            return;
//        }
//
//        new PgTasks().updateWithCondition(req.body.task_id, req.body.condition_query, req.body.sengine_id,
//                req.body.region, req.body.size_search)
//            .then(function (db_res) {
//                callback(db_res, res);
//            })
//            .catch(function (err) {
//                errback(err, res);
//            })
//    });
    var serverFree = true;
    app.post('/api/calc_params', function (req, res, next) {
        console.log('/api/calc_params', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id!=1){
            errback(null, res, "Вы не админ.");
            return;
        }

        if (!serverFree) {
            errback(null, res, "Сервер занят, попробуйте позже.");
            return;
        }

        if (!req.body.url) {
            errback(null, res, "Не найден параметр url.");
            return;
        }

        if (!req.body.condition_id) {
            errback(null, res, "Не найден параметр condition_id.");
            return;
        }

        if (!req.body.task_id) {
            errback(null, res, "Не найден параметр task_id.");
            return;
        }

        if (!req.body.user_id) {
            errback(null, res, "Не найден параметр user_id.");
            return;
        }

        serverFree = false;
        return new Core().calcParams(req.body.condition_id, req.body.user_id)
            .then(function () {
                return new Core().calcParamsByUrl(req.body.url, req.body.condition_id)
            })
            .then(function (res2) {
                return new PgTasks().updateWithDateCalc(req.body.task_id, new Date())
            })
            .then(function () {
                callback("ok", res);
                serverFree = true
            })
            .catch(function (err) {
                serverFree = true
                errback(err, res);
                serverFree = true
            })

    });

    app.post('/api/calc_site_params', function (req, res, next) {
        console.log('/api/calc_site_params', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.condition_id) {
            errback(null, res, "Не найден параметр condition_id.");
            return;
        }

        return new Core().calcParamsByUrl(req.body.url, req.body.condition_id)
            .then(function () {
                callback("ok", res);
            })
            .catch(function (err) {
                //console.log(err, err.stack);
                //errback("", res);
                errback(err, res)
            })
    });

    app.post('/api/get_paramtypes', function (req, res, next) {
        console.log('/api/get_paramtypes', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.condition_id) {
            errback(null, res, "не найдены параметры condition_id");
            return;
        }

        if (!req.body.url_id) {
            errback(null, res, "не найдены параметры url_id");
            return;
        }
        return new PgParams().getParamtypesForUrl(req.body.condition_id, req.body.url_id)
            .then(function (paramtypes) {
                if (!paramtypes || !paramtypes.length){
                    errback( null, res, 'Еще не посчитан ни один тип параметра')
                    return
                }
                var tree = new SeoFormat().getTreeFromParamtypes(paramtypes)
                callback(tree, res)
            })
            .catch(function (err) {
                //console.log(err, err.stack);
                //errback("", res);
                errback(err, res)
            })
    })

    app.post('/api/get_params', function (req, res, next) {
        console.log('/api/get_params', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res,"Вы не зарегистрировались.");
            return;
        }

        if (!req.body.condition_id) {
            errback(null, res, "не найдены параметры condition_id");
            return;
        }

        if (!req.body.url_id) {
            errback(null, res, "не найдены параметры url_id");
            return;
        }

        if (!req.body.param_type) {
            errback(null, res, "не найдены параметры param_type");
            return;
        }

        var search;
        var paramsChart;
        var corridor;
        return new PgSearch().getLastSearch(req.body.condition_id)
            .then(function (searchRes) {
                if (!searchRes){
                    errback( null, res, 'Еще не получена поисковая выдача')
                    return
                }
                search = searchRes;
                return new PgParams().getParamDiagram(search.search_id, req.body.param_type)
            })
            .then(function (paramsChartRes) {
                if (!paramsChartRes || !paramsChartRes.length){
                    errback( null, res, 'Еще не получены данные выборки')
                    return
                }
                paramsChart = paramsChartRes;
                return new PgCorridor().get(search.search_id, req.body.param_type)
            })
            .then(function (corridorRes) {
                corridor = corridorRes;
                return new PgHtmls().getLastHtml(req.body.url_id)
            })
            .then(function (html) {
                if (!html) {
                    errback(null, res, 'Еще не получены данные для Вашего сайта. Нажмите "Пересчитать сайт".')
                    return
                }
                return new PgParams().getSiteParam(req.body.condition_id, html.html_id, req.body.param_type )
            })
            .then(function (siteParams) {
                if (!siteParams || !siteParams.length){
                    errback( null, res, 'Еще не получены параметры для Вашего сайта. Нажмите "Пересчитать сайт".')
                    return
                }
                diagram = new Diagram();
                //форматируем данные работаем с диаграммой.
                var paramsDiagram = diagram.getParamsDiagram(paramsChart, siteParams, corridor);
                callback(paramsDiagram, res)
            })
            .catch(function (err) {
                //console.log(err, err.stack);
                //errback("", res);
                errback(err, res);
            })
    });

    app.post('/api/login', function (req, res, next) {
            passport.authenticate('login', function (err, user, info) {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    return errback(null, res, info.message);
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return callback(info.message, res);
                });
            })(req, res, next);
        }
    );

    app.get('/api/logout', function (req, res) {
        console.log('/api/logout');
        req.logout();

        return callback("logout ok", res);
    });
-
    app.post('/api/register', function (req, res, next) {
        console.log('/api/register', req.body);

        if (!req.body.login || !req.body.password) {
            errback(null, res, "Не найдены все параметры  ");
            return;
        }

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Нет зарегистрированного пользователя!");
            return;
        }

        if (req.user.role_id != 1) {
            errback(null, res, "Нет прав для добавления пользователей!");
            return;
        }

        new PgUsers().insert(req.body.login, req.body.password, 3)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.get('/api/check_auth', function (req, res, next) {
        // if user is authenticated in the session, carry on
        var r = {isAuth: req.isAuthenticated(), isAdmin:  req.isAuthenticated() && req.user.role_id == 1,
            userLogin: req.isAuthenticated() ? req.user.user_login : "",
            userId: req.isAuthenticated() ? req.user.user_id : ""}

        if (req.isAuthenticated() && req.user.disabled){
            console.log('user ' + req.user.user_login + ' is disabled!')
            req.logout();
            r.isAuth = false;
            r.isAdmin = false;
        }

        if (req.isAuthenticated()) {
            // запомним, что пользователь заходил
            new PgUsers().updateLastVisit(req.user.user_id);
        }
        console.log('/api/check_auth', r)
        callback(r, res);
    });

}
