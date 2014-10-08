var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Api = require("./server/api");
var DbInit = require("./server/db/db_init")

var app = express();

new Api(app);
new DbInit();

app.set('port', process.env.PORT || 3000);
app.disable("x-powered-by");
app.disable('etag');
app.use(express.compress());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'client')));
app.use('/bower_components/', express.static(__dirname + '/bower_components/'))

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});