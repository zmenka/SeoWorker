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

app.set('port', process.env.PORT || 5000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});