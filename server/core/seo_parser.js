var htmlparser = require("htmlparser2");
var select = require('soupselect').select;
var Promise = require("../utils/promise");

function SeoParser(rawHtml) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var handler = new htmlparser.DomHandler(function (error, dom) {
            if (error) {
                reject('error with pars html ' + error)
            }
            else {

                _this.dom = dom;
                resolve(_this)
            }

        }, {normalizeWhitespace: true});

        var parser = new htmlparser.Parser(handler);
        parser.write(rawHtml);
        parser.done();
    })
}

SeoParser.prototype.getTag = function (tagName ) {
    return select(this.dom, tagName);

};

SeoParser.prototype.getByClassName = function (className ) {
    return select(this.dom, '.' + className);

};
SeoParser.prototype.getById = function (id ) {
    return select(this.dom, '#' + id);

};


module.exports = SeoParser;