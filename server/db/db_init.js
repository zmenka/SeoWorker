var mongoose = require('mongoose'); 					// mongoose for mongodb

module.exports = function DbInit () {
    mongoose.connect('mongodb://localhost/seo'); 	// connect to mongoDB database
}