var htmlparser = require("htmlparser2");
var select = require('soupselect').select;

function SeoParser(rawHtml, callback, errback) {
    console.log('Parser init');
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            errback('error with pars html ' + error);
        }
        else {
            console.log("DOM done");
            callback(dom);
        }

    }, {normalizeWhitespace: true});

    var parser = new htmlparser.Parser(handler);
    parser.write(rawHtml);
    parser.done();
};

SeoParser.getTag = function (tagName, rawHtml, callback, errback ) {
    new SeoParser(rawHtml, function (dom){
        callback(select(dom, tagName));
    }, errback)

}

module.exports = SeoParser;