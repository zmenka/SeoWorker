// set up ========================
var express = require('express');
var app = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var morgan = require('morgan'); 			// log requests to the console (express4)
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

var http = require("http");
var fs = require('fs');
var path = require('path');

// configuration =================

mongoose.connect('mongodb://localhost/seo'); 	// connect to mongoDB database

app.use(express.static(__dirname + '/public')); 				// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 										// log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

// define model =================
var Site = mongoose.model('Site', {
    url: String,
    raw_html: String,
    date_create: Date,
    path: String
});

// routes ======================================================================

// api ---------------------------------------------------------------------

// get all sites
app.get('/api/sites', function (req, res) {

    // use mongoose to get all sites in the database
    Site.find({}).sort({"date_create": -1}).exec(function (err, sites) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(sites); // return all sites in JSON format
    });
});

// create Site
app.post('/api/site', function (req, res) {
    console.log('/api/site', req.body);
    res.statusCode = 200;
    // скачиваем по адресу html
    var options = {
        host: req.body.url,
        port: 80,
        path: "/"
    };

    var content = "";
    var date_create = Date.now();

    var req1 = http.request(options, function (res1) {
        res1.setEncoding("utf8");
        res1.on("data", function (chunk) {
            content += chunk;
        });

        res1.on("end", function () {
            console.log("содержимое сайте получено! ", content);

            //запишем в файл
            //var fileName = path.dirname(require.main.filename) + "/files/" + req.body.url + "_" + date_create + ".html";
            var fileName = req.body.url + "_" + date_create + ".html";
            fs.writeFile(fileName, content, function (err) {
                if (err) {
                    console.log("Ошибка при сохранении в файл", err);
                } else {
                    console.log("The file was saved in ", fileName);

                }
            });

            // create a Site
            Site.create({
                url: req.body.url,
                raw_html: content,
                date_create: date_create,
                path: fileName
            }, function (err, site) {
                if (err) {
                    res.statusCode = 440;
                    res.send(err);
                }
                // return all
                Site.find({}).sort({"date_create": -1}).exec(function (err, sites) {
                    if (err) {
                        res.statusCode = 440;
                        res.send(err);
                    }
                    res.json(sites);
                });
            });
        });
    });

    req1.end();
    req1.on('error', function (e) {
        console.error(e);
        res.statusCode = 440;
        res.send(e);
    });
});


// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


// listen (start app with node server.js) ======================================
app.listen(5000);
console.log("App listening on port 5000");