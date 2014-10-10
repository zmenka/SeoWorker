var Searcher = require("./searcher");
var Site = require("./db/site");

module.exports = function Api(app) {
    this.app = app;

// routes ======================================================================

// api ---------------------------------------------------------------------

// get all sites
    app.get('/api/sites', function (req, res, next) {
        console.log('/api/sites ALL');
        // use mongoose to get all sites in the database
        Site.find({}).sort({"date_create": -1}).exec(function (err, sites) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(sites); // return all sites in JSON format
        });
    });

    app.get('/api/sites/:id', function (req, res, next) {
        console.log('/api/sites/:id', req.params);
        Site.findById(req.params.id, function (err, show) {
            if (err) return next(err);
            res.send(show);
        });
    });

// create Site
    app.post('/api/sites', function (req, res, next) {
        console.log('/api/sites create', req.body);
        res.statusCode = 200;

        var searcher = new Searcher();
        searcher.saveSite(req.body.url,
            function () {
                res.json("ok");
            },
            function (err) {
                res.statusCode = 440;
                console.log("create site error: ", err)
                res.send(err);
            });

    });

// application -------------------------------------------------------------
//    app.get('*', function (req, res) {
//        //res.sendfile('./src/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
//        //res.redirect('/#' + req.originalUrl);
//    });
}
