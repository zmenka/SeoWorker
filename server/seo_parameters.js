var SeoParser = require("./seo_parser");

function SeoParameters() {
    console.log('SeoParameters init');
};

var regexpSplit = /[\s,\s-\s,\.;:/\(\)!\?\[\]{}_\\\|~<>*\+=]+/;
/*
 среднее совпадение двух фраз
 */
SeoParameters.complianceStrings = function (text1, text2) {
    var matchWords = 0;
    // - плохо очитывается!!!
    var words1 = text1.toLowerCase().split(regexpSplit).filter(function (e) {
        return e
    });
    var words2 = text2.toLowerCase().split(regexpSplit).filter(function (e) {
        return e
    });
    for (var key in words1) {
        if (words2.indexOf(words1[key]) > -1) {
            matchWords++;
        }
    }
    var maxLength = words1.length;
    if (words2.length > maxLength) {
        maxLength = words2.length;
    }
    console.log('averageMatch', text1, text2);
    console.log(words1, words2);
    console.log(maxLength, matchWords)
    if (maxLength > 0) {
        return matchWords * 100 / maxLength;
    } else {
        return 0;
    }
}

SeoParameters.titleCS = function (keyText, rawHtml, callback, errback) {
    SeoParser.getTag('title',rawHtml, function (titles){
        if (!titles || titles.length !=1){
            errback();
        }

        callback(SeoParameters.complianceStrings(titles[0].children[0].data, keyText));
    }, errback);
}

module.exports = SeoParameters;