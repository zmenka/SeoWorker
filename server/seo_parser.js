var htmlparser = require("htmlparser2");
var select = require('soupselect').select;
var Q = require('q')
function SeoParser() {
    //console.log('Parser init');
};

SeoParser.prototype.initDom = function (rawHtml, callback, errback ) {
  _this = this;
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            errback('error with pars html ' + error);
        }
        else {

            _this.dom = dom;
            callback();
        }

    }, {normalizeWhitespace: true});

    var parser = new htmlparser.Parser(handler);
    parser.write(rawHtml);
    parser.done();
}

SeoParser.prototype.initDomQ = function (rawHtml) {
    _this = this;
    var deferred = Q.defer();
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            deferred.reject('error with pars html ' + error)
        }
        else {

            _this.dom = dom;
            deferred.resolve(_this)
        }

    }, {normalizeWhitespace: true});

    var parser = new htmlparser.Parser(handler);
    parser.write(rawHtml);
    parser.done();
    return deferred.promise;
}

SeoParser.prototype.getTag = function (tagName ) {
    return select(this.dom, tagName);

}

SeoParser.prototype.getByClassName = function (className ) {
    return select(this.dom, '.' + className);

}
SeoParser.prototype.getById = function (id ) {
    return select(this.dom, '#' + id);

}


module.exports = SeoParser;