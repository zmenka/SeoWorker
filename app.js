// set up ========================
var express = require('express');
var app = express(); 								// create our app w/ express
var morgan = require("morgan");             //log requests to console
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)

var http = require("http");
var fs = require('fs');
var path = require('path');

// configuration =================

app.use(express.static(__dirname + '/public')); 				// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 										// log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());


var api = require("./src/api");
new api(app);

// listen (start app with node server.js) ======================================
app.listen(5000);
console.log("App listening on port 5000");