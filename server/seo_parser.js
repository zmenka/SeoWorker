var htmlparser = require("htmlparser2");
var select = require('soupselect').select;

function SeoParser() {
    console.log('Parser init');
};

SeoParser.prototype.initDom = function (rawHtml, callback, errback ) {
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            errback('error with pars html ' + error);
        }
        else {
            console.log("DOM done");
            SeoParser.prototype.dom = dom;
            callback();
        }

    }, {normalizeWhitespace: true});

    var parser = new htmlparser.Parser(handler);
    parser.write(rawHtml);
    parser.done();
}

SeoParser.prototype.getTag = function (tagName ) {
    return select(SeoParser.prototype.dom, tagName);

}

module.exports = SeoParser;