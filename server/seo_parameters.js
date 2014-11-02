var SeoParser = require("./seo_parser");

function SeoParameters() {
    console.log('SeoParameters init');
};

var regexpSplit = /[\s,\-\.;:/\(\)!\?\[\]{}_\\\|~<>*\+=]+/;
/*
 среднее совпадение двух фраз
 */
SeoParameters.prototype.complianceStringsVal = function (text1, text2) {
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
        return (matchWords * 100 / maxLength);
    } else {
        return null;
    }
}
//получаем строку с процентом вхождения фразы text2 в text1
SeoParameters.prototype.complianceStrings = function (text1, text2) {
    var res = this.complianceStringsVal(text1,text2);
    if (res == null){
        return "Ошибка в длине!";
    }
    return res.toFixed(2) + '%';
}
SeoParameters.prototype.init = function (keyText, rawHtml, callback, errback) {
    this.keyText = keyText;
    this.parser = new SeoParser();
    this.parser.initDom(rawHtml, callback, errback);
}

//процент вхождения фразы в первом тэге tag
SeoParameters.prototype.tagCS = function (tag) {
    if (this.parser.getTag(tag).length>0) {
        //console.log(this.parser.getTag(tag)[0].children);
        data = getData(this.parser.getTag(tag)[0].children);
        return this.complianceStrings(data, this.keyText)
    }
    return 'Нет тега ' + tag;
}
//средний процент вхождения фразы среди всех тэгов tag
SeoParameters.prototype.tagCSAvg = function (tag) {
    var cnt = 0;
    if (this.parser.getTag(tag).length>0) {
        for (i in this.parser.getTag(tag)) {
            //console.log(this.parser.getTag(tag)[0].children);
            data = getData(this.parser.getTag(tag)[0].children);
            cnt += this.complianceStringsVal(data, this.keyText)
        }
        return cnt/this.tagCount(tag);
    }
    return 'Нет тега ' + tag;
}
//количество блоков с тэгом tag
SeoParameters.prototype.tagCount = function (tag) {
    return this.parser.getTag(tag).length;
}
//считаем суммарную длину в символах data всех тэгов tag
SeoParameters.prototype.tagLengthAll = function (tag) {
    var tags = this.parser.getTag(tag);
    console.log(tags);
    if(tags == undefined || tags.length == 0)
        return null;
    var data = getData(this.parser.getTag(tag));
    console.log(data);
    return data.length;
}
//считаем суммарную длину в символах data первого тэга tag
SeoParameters.prototype.tagLengthFirst = function (tag) {
    var tags = this.parser.getTag(tag);
    console.log(tags);
    console.log(data);
    if(tags == undefined || tags.length == 0)
        return null;
    var data = getData(tags[0]);
    return data.length;
}
//считаем среднюю длину в символах data среди всех тэгов tag
SeoParameters.prototype.tagLengthAvg = function (tag) {
    var tags = this.parser.getTag(tag);
    console.log(tags);
    if(tags == undefined || tags.length == 0)
        return null;
    var data = getData(this.parser.getTag(tag));
    console.log(data);
    var count = tags.length;
    return data.length/count;
}
//получаем data тэга tag
function getData(obj) {
    if (obj == undefined)
        return null;
    var out = '';
    //воспринимаем это как НЕ массив
    if (obj.hasOwnProperty('children')) {
        out += getData(obj.children);
    }
    if (obj.hasOwnProperty('data')) {
        out += obj.data;
    }
    //воспринимаем это как массив
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