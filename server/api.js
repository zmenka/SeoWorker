var PgUsers = require("./db/models/pg_users");
var PgSengines = require("./db/models/pg_sengines");
var PgRegions = require("./db/models/pg_regions");
var PgGroups = require("./db/models/pg_groups");
var PgRoles = require("./db/models/pg_roles");
var PgParams = require("./db/models/pg_params");
var PgUscondurls = require("./db/models/pg_uscondurls");
var PgPositions = require("./db/models/pg_positions");
var PgPercents = require("./db/models/pg_percents");
var Updater = require("./core/updater");
var PgCorridor = require("./db/models/pg_corridors");
var SeoFormat = require("./SeoFormat");
var Diagram = require("./Diagram");
//var Core = require("./core/core");
var Users = require("./models/users");

var ApiUtils = require("./utils/api_utils");

module.exports = function Api(app, passport) {

    app.get('/api/users', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgUsers.listWithSitesCount, [req.user.user_id, req.user.role_id])
    });

    app.get('/api/condurl/positions/all', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgPositions.list_all_by_condurl, [req.query.condurl_id])
    });

    app.get('/api/condurl/percents/all', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgPercents.list_all_by_condurl, [req.query.condurl_id])
    });

    app.get('/api/user/positions/all', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgPositions.list_all_by_user, [req.user.user_id])
    });

    app.get('/api/user/percents/all', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgPercents.list_all_by_user, [req.user.user_id])
    });

    app.get('/api/user', function (req, res) {
        ApiUtils.admin_api_func(req, res, PgUsers.get, [req.query.user_id])
    });

    app.post('/api/edit_user', function (req, res, next) {
        ApiUtils.admin_api_func(req, res, PgUsers.edit, [req.body.user_id, req.body.new_login, req.body.new_pasw, req.body.disabled, req.body.disabled_message])
    });

    app.get('/api/user_sites_and_tasks', function (req, res) {
        console.log(req.query, req.user);
        ApiUtils.auth_api_func(req, res, Users.userSitesAndTasks, [req.query.user_id, req.user.user_id, req.user.role_id, req.query.with_disabled])
    });

    app.get('/api/sengines', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgSengines.list, [])
    });

    app.get('/api/regions', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgRegions.list, [])
    });

    app.get('/api/groups', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgGroups.listAdminGroups, [req.user.user_id, req.user.role_id])
    });

    app.post('/api/create_group', function (req, res) {
        ApiUtils.admin_api_func(req, res, PgGroups.insert, [req.body.name])
    });

    app.get('/api/roles', function (req, res) {
        ApiUtils.auth_api_func(req, res, PgRoles.list, [])
    });

    app.post('/api/create_task', function (req, res) {
        ApiUtils.auth_api_func(req, res,
            PgUscondurls.new,
            [req.body.user_id, req.body.url, req.body.condition_query, 10,  req.body.region_id, req.body.sengine_id]
        )
    });

    app.post('/api/remove_task', function (req, res, next) {
        console.log('/api/remove_task', req.body);

        if (!req.user || !req.user.user_id) {
            ApiUtils.errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.uscondurl_id) {
            ApiUtils.errback(null, res, "не найдены все параметры! ");
            return;
        }

        return new PgUscondurls().remove(req.body.uscondurl_id)
            .then(function (db_res) {
                ApiUtils.callback(db_res, res);
            })
            .catch(function (err) {
                ApiUtils.errback(err, res);
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
            ApiUtils.errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id != 1) {
            ApiUtils.errback(null, res, "Вы не админ.");
            return;
        }

        if (!serverFree) {
            ApiUtils.errback(null, res, "Сервер занят, попробуйте позже.");
            return;
        }

        if (!req.body.condition_id) {
            ApiUtils.errback(null, res, "Не найден параметр condition_id.");
            return;
        }

        serverFree = false;
        return Updater.update(req.body.condition_id)
            .then(function () {
                ApiUtils.callback("ok", res);
                serverFree = true
            })
            .catch(function (err) {
                serverFree = true
                ApiUtils.errback(err, res);
            })

    });

    app.post('/api/calc_site_params', function (req, res, next) {
        console.log('/api/calc_site_params', req.body);

        if (!req.user || !req.user.user_id) {
            ApiUtils.errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.condition_id) {
            ApiUtils.errback(null, res, "Не найден параметр condition_id.");
            return;
        }

        if (!req.body.url_id) {
            ApiUtils.errback(null, res, "Не найден параметр url_id.");
            return;
        }

        return Updater.updateOneUrl(req.body.condition_id, req.body.url_id)
            .then(function () {
                ApiUtils.callback("ok", res);
                serverFree = true
            })
            .catch(function (err) {
                serverFree = true
                ApiUtils.errback(err, res);
            })
    });

    app.post('/api/get_paramtypes', function (req, res, next) {
        console.log('/api/get_paramtypes', req.body);

        if (!req.user || !req.user.user_id) {
            ApiUtils.errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.condition_id) {
            ApiUtils.errback(null, res, "не найдены параметры condition_id");
            return;
        }

        if (!req.body.url_id) {
            ApiUtils.errback(null, res, "не найдены параметры url_id");
            return;
        }
        return PgParams.getParamtypesForUrl(req.body.condition_id, req.body.url_id)
            .then(function (paramtypes) {
                if (!paramtypes || !paramtypes.length) {
                    ApiUtils.errback(null, res, 'Еще не посчитан ни один тип параметра')
                    return
                }
                var tree = SeoFormat.getTreeFromParamtypes(paramtypes)
                ApiUtils.callback(tree, res)
            })
            .catch(function (err) {
                //console.log(err, err.stack);
                //errback("", res);
                ApiUtils.errback(err, res)
            })
    })

    app.post('/api/get_params', function (req, res, next) {
        console.log('/api/get_params', req.body);

        if (!req.body.condition_id) {
            ApiUtils.errback(null, res, "не найдены параметры condition_id");
            return;
        }

        if (!req.body.url_id) {
            ApiUtils.errback(null, res, "не найдены параметры url_id");
            return;
        }

        if (!req.body.param_type) {
            ApiUtils.errback(null, res, "не найдены параметры param_type");
            return;
        }

        var search;
        var paramsChart;
        var corridor;
        var diagram;
        return PgParams.getParamDiagram(req.body.condition_id, req.body.param_type)
            .then(function (paramsChartRes) {
                if (!paramsChartRes || !paramsChartRes.length) {
                    throw new Error ('Еще не получены данные выборки')
                }
                paramsChart = paramsChartRes;
                return PgCorridor.find(req.body.condition_id, req.body.param_type)
            })
            .then(function (corridorRes) {
                corridor = corridorRes;
                return PgParams.getSiteParam(req.body.condition_id, req.body.url_id, req.body.param_type)
            })
            .then(function (siteParams) {
                if (!siteParams) {
                    throw new Error ('Еще не получены параметры для Вашего сайта. Нажмите "Пересчитать сайт".')
                }
                diagram = new Diagram();
                //форматируем данные работаем с диаграммой.
                var paramsDiagram = diagram.getParamsDiagram(paramsChart, siteParams, corridor);
                return ApiUtils.callback(paramsDiagram, res)
            })
            .catch(function (err) {
                return ApiUtils.errback(err, res);
            })
    });

    app.post('/api/login', function (req, res, next) {
            console.log('/api/login')
            passport.authenticate('login', function (err, user, info) {
                if (err) {
                    return next(err)
                }
                if (!user) {
                    return ApiUtils.errback(null, res, info.message);
                }
                req.logIn(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return ApiUtils.callback(info.message, res);
                });
            })(req, res, next);
        }
    );

    app.get('/api/logout', function (req, res) {
        console.log('/api/logout');
        req.logout();
        return ApiUtils.callback("logout ok", res);
    });

        app.post('/api/register', function (req, res, next) {
            console.log('/api/register', req.body);

            if (!req.body.login || !req.body.password || !req.body.role_id) {
                ApiUtils.errback(null, res, "Не найдены все параметры  ");
                return;
            }

            if (!req.user || !req.user.user_id) {
                ApiUtils.errback(null, res, "Вы не зарегистрированы.");
                return;
            }

            new PgUsers().insert(req.body.login, req.body.password, 3)
                .then(function (user_id) {
                    if (req.body.group_id) {
                        return new PgGroups().addUsGroup(user_id, req.body.group_id, req.body.role_id)
                            .then(function (dbres) {
                                callback(dbres, res)
                            })
                    } else {
                        ApiUtils.callback(user_id, res);
                    }
                })
                .catch(function (err) {
                    ApiUtils.errback(err, res);
                })
        });

    app.get('/api/check_auth', function (req, res, next) {
        console.log('/api/check_auth');
        // if user is authenticated in the session, carry on
        var r = {
            isAuth: req.isAuthenticated(), isAdmin: req.isAuthenticated() && req.user.role_id == 1,
            userLogin: req.isAuthenticated() ? req.user.user_login : "",
            userId: req.isAuthenticated() ? req.user.user_id : "",
            groups: (req.user ? req.user.groups : [])
        }

        if (req.isAuthenticated() && req.user.disabled) {
            console.log('user ' + req.user.user_login + ' is disabled!')
            req.logout();
            r.isAuth = false;
            r.isAdmin = false;
        }

        if (req.isAuthenticated()) {
            // запомним, что пользователь заходил
            PgUsers.updateLastVisit(req.user.user_id);
        }
        console.log('/api/check_auth', r)
        ApiUtils.callback(r, res);
    });

}
