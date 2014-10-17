
function SeoParameters() {
    console.log('SeoParameters init');
};
/*
среднее совпадение двух фраз
 */
SeoParameters.prototype.averageMatch = function (text1, text2) {
    var matchWords = 0;
    var words1 = text1.split(/[\s,-\.;:/\(\)!\?\[\]{}_\\\|~<>*\+=]+/);
    var words2 = text2.split(/[\s,-\.;:/\(\)!\?\[\]{}_\\\|~<>*\+=]+/);
    for (var key in words) {
        if (text2.indexOf(text1[key]) != -1) {
            matchWords++;
        }
    }
    var maxLength = words1.length;
    if (words2.length > maxLength) {
        maxLength = words2.length;
    }

    if (maxLength > 0) {
        return matchWords * 100 / maxLength;
    } else {
        return 0;
    }
}