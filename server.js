var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var expressSession = require('express-session');

var Api = require("./server/api");
var app = express();

require('./server/passport')(passport); // pass passport for configuration
// required for passport
app.use(expressSession({ secret: 'rewrweksdfklgirojkfsddfg',
    saveUninitialized: true,
    resave: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.set('port', process.env.PORT || 3000);
app.disable("x-powered-by");
app.disable('etag');
app.use(express.compress());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'client/files')));
app.use('/bower_components/', express.static(__dirname + '/bower_components/'))

new Api(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});