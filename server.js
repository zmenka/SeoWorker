var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var pg = require('pg')
var pgSession = require('connect-pg-simple')(session);

var Config = require('./server/config');
var Logger = require('./server/utils/logger');
var Api = require("./server/api");
var app = express();


app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser(Config.passport_key));

app.use(session({
    store: new pgSession({
        pg : pg,
        conString : Config.postgres,
        tableName : 'session'
    }),
    saveUninitialized: true,
    resave: false,
    secret: Config.passport_key,
    cookie: {httpOnly: true,  maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

require('./server/passport')(passport); // pass passport for configuration
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


app.disable("x-powered-by");
app.disable('etag');


app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'client/files')));
app.use('/bower_components/', express.static(__dirname + '/bower_components/'))

new Api(app, passport); // load our routes and pass in our app and fully configured passport

if (Config.isHeroku){
    app.listen(Config.port, function () {
        Logger.INFO('Express server listening on port ' + Config.port + ', ip ' + Config.private_ip);
    });
} else {
    app.listen(Config.port, Config.private_ip, function () {
        Logger.INFO('Express server listening on port ' + Config.port + ', ip ' + Config.private_ip);
    });
}


module.exports = app;