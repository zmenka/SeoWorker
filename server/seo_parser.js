var htmlparser = require("htmlparser2");

function SeoParser() {
    console.log('Parser init');
};

SeoParser.prototype.parseHtml = function (rawHtml, callback, errback) {
    var handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
            errback(error);
        }
        else {
            console.log("DOM", dom);
            callback(dom);
        }

    }, {normalizeWhitespace: true});
    var parser = new htmlparser.Parser(handler);
    parser.write(rawHtml);
    parser.done();

};

module.exports = SeoParser;