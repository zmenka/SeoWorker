var Searcher = require("./searcher");
var PgSites = require("./db/postgres/pg_sites");
var SeoParameters = require("./seo_parameters");
var BunSearcher = require("./bun_searcher");
var callback = function (data, response) {
    response.json(data);
};

var errback = function (err, response) {
    response.statusCode = 440;
    response.send(err);
};

module.exports = function Api(app) {
    this.app = app;

// routes ======================================================================

// api ---------------------------------------------------------------------

// get all sites
    app.get('/api/sites', function (req, res, next) {
        console.log('/api/sites ALL');
        // use mongoose to get all sites in the database
        new PgSites().getSites(function (sites) {
            callback(sites, res);
        }, function (err) {
            errback(err, res);
        })

    });

    app.get('/api/sites/:id', function (req, res, next) {
        console.log('/api/sites/:id', req.params);
        new PgSites().getSite(req.params.id, function (site) {

            callback(site, res);
        }, function (err) {
            errback(err, res);
        })
    });

// create Site
    app.post('/api/sites', function (req, res, next) {
        console.log('/api/sites create', req.body);
        res.statusCode = 200;

        var searcher = new Searcher();
        searcher.getContentByUrl(req.body.url,
            function (body) {
                new PgSites().saveSite(req.body.url, body, function () {
                    callback("ok", res);
                }, function (err) {
                    errback(err, res);
                });

            },
            function (err) {
                errback(err, res);
            });

    });

    app.post('/api/calculation', function (req, res, next) {
        console.log('/api/calculation', req.body);
        if (!req.body.site_id || !req.body.key_words) {
            errback("не найдены параметры site_id или key_words", res);
            return;
        }
        try {
            new Searcher().getSite(req.body.site_id, function (site) {
                var params = new SeoParameters();
                params.init(req.body.key_words, site.url, site.raw_html, function () {
                    var params_res = params.getAllParams();
                    callback(params_res, res);
                }, function (err1) {
                    console.log("Ошбика при подсчете titleCS", err);
                    errback(err1, res);
                });

            }, function (err) {
                errback(err, res);
            })
        } catch (e) {
            errback(e, res);
        }
    });

    app.post('/api/parse', function (req, res, next) {
        console.log('/api/parse', req.body);
        if (!req.body.site_id || !req.body.key_words) {
            errback("не найдены параметры site_id или key_words", res);
            return;
        }
        try {
            new Searcher().getSite(req.body.site_id, function (site) {
                var params = new SeoParameters();
                params.init(req.body.key_words, site.url, site.raw_html, function () {
                    var params_res = params.parse();

                    callback(params_res, res);
                }, function (err1) {
                    console.log("Ошбика при подсчете titleCS", err);
                    errback(err1, res);
                });

            }, function (err) {
                errback(err, res);
            })
        } catch (e) {
            errback(e, res);
        }
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

}
