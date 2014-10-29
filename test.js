var params = require("./server/seo_parameters");

var SeoParams = new params();

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

var obj = [
    {children: [
        {data: "data2"},
        {data: "data3", children: []}
    ]},
    {data: "data5"},
    {data: "data1", children: []}
];
console.log(getData(obj))
//console.log(SeoParams.averageMatch('Мама мыла раму голубой тряпкой', 'Мыла ли мама эту раму губкой, или чем-то другим?'))