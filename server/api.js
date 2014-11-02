var Searcher = require("./searcher");
var PgSites = require("./db/postgres/pg_sites");
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
        if (!req.body.site_id || !req.body.key_words){
            errback("не найдены параметры site_id или key_words", res);
            return;
        }
        new PgSites().getSite(req.body.site_id, function (site) {
            var params = new SeoParameters();
            params.init(req.body.key_words, site.raw_html, function () {
                var titleCS = params.tagCS("title");
                var h1CS = params.tagCS("h1");
                var h2CS = params.tagCS("h2");
                var h3CS = params.tagCS("h3");
                var h2Count = params.tagCount("h2");
                var h3Count = params.tagCount("h3");
                var h3CSAvg = params.tagCSAvg("h3");
                var titleLength = params.tagLengthAll("title");
                var h1Length = params.tagLengthAll("h1");
                var h2Length = params.tagLengthAll("h2");
                var h2LengthFirst = params.tagLengthFirst("h2");
                var h2LengthAvg = params.tagLengthAvg("h2");
                var h3Length = params.tagLengthAll("h3");
                var h3LengthFirst = params.tagLengthFirst("h3");
                var h3LengthAvg = params.tagLengthAvg("h3");
                var params_res = [
                    {name: "titleCS", val: titleCS },
                    {name: "h1CS", val: h1CS },
                    {name: "h2CS", val: h2CS },
                    {name: "h3CS", val: h3CS },
                    {name: "h2Count", val: h2Count },
                    {name: "h3Count", val: h3Count },
                    {name: "h3CSAvg", val: h3CSAvg },
                    {name: "titleLength", val: titleLength },
                    {name: "h1Length", val: h1Length },
                    {name: "h2Length", val: h2Length },
                    {name: "h2LengthFirst", val: h2LengthFirst },
                    {name: "h2LengthAvg", val: h2LengthAvg },
                    {name: "h3Length", val: h3Length },
                    {name: "h3LengthFirst", val: h3LengthFirst },
                    {name: "h3LengthAvg", val: h3LengthAvg }
                ];
                callback(params_res, res);
            }, function (err1) {
                console.log("Ошбика при подсчете titleCS", err);
                errback(err1, res);
            });

        }, function (err) {
            errback(err, res);
        })
    });

}
