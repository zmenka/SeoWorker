var PgUsers = require("./db/postgres/pg_users");
var PgUsurls = require("./db/postgres/pg_usurls");
var PgTasks = require("./db/postgres/pg_tasks");
var PgSearch = require("./db/postgres/pg_search");
var PgSengines = require("./db/postgres/pg_sengines");
var PgRegions = require("./db/postgres/pg_regions");
var PgGroups = require("./db/postgres/pg_groups");
var PgRoles = require("./db/postgres/pg_roles");
var PgParams = require("./db/postgres/pg_params");
var PgHtmls = require("./db/postgres/pg_htmls");
var PgCorridor = require("./db/postgres/pg_corridor");
var SeoFormat = require("./SeoFormat");
var Diagram = require("./Diagram");
var Core = require("./core");
var Access = require("./utils/access");

var callback = function (data, response) {
    response.json(data);
};

var errback = function (err, response, userMsg) {
    var msg = (err && err.stack) ? err.stack : (err ? err : userMsg)
    console.log(msg);
    response.statusCode = 440;
    var userMsgResult = userMsg ? userMsg : (err && !err.message ? err : '');
    response.send(userMsgResult);
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

        return new PgUsers().listWithSitesCount(req.user.user_id, req.user.role_id)
            .then(function (users) {
                callback(users, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.get('/api/user', function (req, res, next) {
        console.log('/api/user', req.query);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id != 1) {
            errback(null, res, "Вы не админ.");
            return;
        }

        if (!req.query.user_id) {
            errback(null, res, "Не найден ид пользователя.");
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

        if (req.user.role_id != 1) {
            errback(null, res, "Вы не админ.");
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

        if (!req.query.user_id || !req.query.with_disabled) {
            errback(null, res, "Не найдены все параметры ");
            return;
        }
        var with_disabled = req.query.with_disabled == 'true' ? true : false;

        return new Access().isUserAvailableToUser(req.query.user_id, req.user.user_id, req.user.role_id)
            .then(function (isAvailable) {
                if (!isAvailable) {
                    errback("Нет доступа", res)
                    return
                }
                return new PgUsurls().listWithTasks(req.query.user_id, with_disabled)
                    .then(function (dirty_sites) {
                        var SF = new SeoFormat();
                        var sites = SF.createSiteTree(dirty_sites);
                        callback(sites, res);
                    })
                    .catch(function (err) {
                        errback(err, res);
                    })
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

    app.get('/api/regions', function (req, res, next) {
        console.log('/api/regions');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        return new PgRegions().list()
            .then(function (sites) {
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.get('/api/groups', function (req, res, next) {
        console.log('/api/groups');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        return new PgGroups().listAdminGroups(req.user.user_id, req.user.role_id)
            .then(function (sites) {
                callback(sites, res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.post('/api/create_group', function (req, res, next) {
        console.log('/api/create_group');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (req.user.role_id != 1) {
            errback(null, res, "Вы не админ.");
            return;
        }

        if (!req.body.name) {
            errback(null, res, "Не найдено название группы ");
            return;
        }

        return new PgGroups().insert(req.body.name)
            .then(function () {
                callback("", res);
            })
            .catch(function (err) {
                errback(err, res);
            })

    });

    app.get('/api/roles', function (req, res, next) {
        console.log('/api/roles');

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        return new PgRoles().list()
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
            errback(null, res, "Вы не зарегистрировались.");
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

    app.post('/api/remove_site', function (req, res, next) {
        console.log('/api/remove_site', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.usurl_id) {
            errback(null, res, "не найден параметр usurl_id ");
            return;
        }
        return new PgUsurls().remove(req.body.usurl_id)
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
             || !req.body.size_search) {
            errback(null, res, "не найдены параметры! ");
            return;
        }

        return new PgTasks().insertWithCondition(req.body.usurl_id, req.body.condition_query, req.body.sengine_id,
            req.body.region_id, req.body.size_search)
            .then(function (db_res) {
                callback(db_res, res);
            })
            .catch(function (err) {
                errback(err, res);
            })
    });

    app.post('/api/remove_task', function (req, res, next) {
        console.log('/api/remove_task', req.body);

        if (!req.user || !req.user.user_id) {
            errback(null, res, "Вы не зарегистрировались.");
            return;
        }

        if (!req.body.task_id) {
            errback(null, res, "не найдены все параметры! ");
            return;
        }

        return new PgTasks().remove(req.body.task_id)
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

        if (req.user.role_id != 1) {
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

        serverFree = false;
        return new Core().calcParams(req.body.condition_id, req.user.user_id)
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
                if (!paramtypes || !paramtypes.length) {
                    errback(null, res, 'Еще не посчитан ни один тип параметра')
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
                if (!searchRes) {
                    errback(null, res, 'Еще не получена поисковая выдача')
                    return
                }
                search = searchRes;
                return new PgParams().getParamDiagram(search.search_id, req.body.param_type)
            })
            .then(function (paramsChartRes) {
                if (!paramsChartRes || !paramsChartRes.length) {
                    errback(null, res, 'Еще не получены данные выборки')
                    return
                }
                paramsChart = paramsChartRes;
                return new PgCorridor().get(search.search_id, req.body.param_type)
            })
            .then(function (corridorRes) {
                corridor = corridorRes;
                return new PgParams().getSiteParam(req.body.condition_id, req.body.url_id, req.body.param_type)
            })
            .then(function (siteParams) {
                if (!siteParams) {
                    errback(null, res, 'Еще не получены параметры для Вашего сайта. Нажмите "Пересчитать сайт".')
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

            if (!req.body.login || !req.body.password || !req.body.role_id) {
                errback(null, res, "Не найдены все параметры  ");
                return;
            }

            if (!req.user || !req.user.user_id) {
                errback(null, res, "Вы не зарегистрированы.");
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
                        callback(user_id, res);
                    }
                })
                .catch(function (err) {
                    errback(err, res);
                })
        });

    app.get('/api/check_auth', function (req, res, next) {
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
            new PgUsers().updateLastVisit(req.user.user_id);
        }
        console.log('/api/check_auth', r)
        callback(r, res);
    });

}
