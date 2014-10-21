var Searcher = require("./searcher");
var SiteMongo = require("./db/site_mongo");
var SeoParameters = require("./seo_parameters");
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
        new SiteMongo().getSites(function (sites) {
            callback(sites, res);
        }, function (err) {
            errback(err, res);
        })

    });

    app.get('/api/sites/:id', function (req, res, next) {
        console.log('/api/sites/:id', req.params);
        new SiteMongo().getSite(req.params.id, function (site) {
            var params = new SeoParameters();
            params.init('Добро пожаловать на Фейсбук', site.raw_html, function () {
                params.titleCS();
                callback(site, res);
            }, function (err) {
                errback(err, res);
            });
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
                new SiteMongo().saveSite(req.body.url, body, function () {
                    callback("ok", res);
                }, function (err) {
                    errback(err, res);
                });

            },
            function (err) {
                errback(err, res);
            });

    });

}
