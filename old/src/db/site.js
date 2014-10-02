/**
 * Created by zmenka on 29.09.14.
 */

var mongoose = require('mongoose');


// define model =================
var Site = mongoose.model('Site', {
    url: String,
    raw_html: String,
    date_create: Date,
    path: String
});

module.exports = Site;
