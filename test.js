var params = require("./server/seo_parameters");

var SeoParams = new params();

console.log(SeoParams.averageMatch('Мама мыла раму голубой тряпкой', 'Мыла ли мама эту раму губкой, или чем-то другим?'))