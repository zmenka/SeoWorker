var SeoParser = require("./seo_parser");

function SeoParameters() {
    console.log('SeoParameters init');
};

var regexpSplit = /[\s,\-\.;:/\(\)!\?\[\]{}_\\\|~<>*\+=]+/;
/*
 среднее совпадение двух фраз
 */
SeoParameters.prototype.complianceStrings = function (text1, text2) {
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
    console.log('параметр по среднему, 1 фраза', text1, '2 фраза ', text2);
    console.log(words1.toString());
    console.log(words2.toString());
    console.log("макс длина", maxLength, "совпадающие слова", matchWords)
    if (maxLength > 0) {
        return (matchWords * 100 / maxLength).toFixed(2) + '%';
    } else {
        return "Ошибка в длине!";
    }
}

SeoParameters.prototype.init = function (keyText, rawHtml, callback, errback) {
    this.keyText = keyText;
    this.parser = new SeoParser();
    this.parser.initDom(rawHtml, callback, errback);
}

SeoParameters.prototype.titleCS = function () {
    if (this.parser.getTag('title')) {
        return this.complianceStrings(this.parser.getTag('title')[0].children[0].data, this.keyText)
    }
    return 'Нет тега';
}

SeoParameters.prototype.h1CS = function () {
    console.log("!!", this.parser.getTag('h1'), "&&&");
    if (this.parser.getTag('h1').length>0) {
        return this.complianceStrings(this.parser.getTag('h1')[0].children[0].data, this.keyText)
    }
    return 'Нет тега';
}

SeoParameters.prototype.tagCS = function (tag) {
    if (this.parser.getTag(tag).length>0) {
        //console.log(this.parser.getTag(tag)[0].children);
        data = getData(this.parser.getTag(tag)[0].children);
        return this.complianceStrings(data, this.keyText)
    }
    return 'Нет тега ' + tag;
}

function getData(obj) {
    var out = '';
    for (var j=0; j< obj.length; j++) {
        if (obj[j].hasOwnProperty('children')) {
            out += getData(obj[j].children);
        }
        if (obj[j].hasOwnProperty('data')) {
            out += obj[j].data;
        }
    }
    return out;
}

module.exports = SeoParameters;