var PG = require("./server/db/postgres/pg");

PG.query('INSE123RT INTO sites(date_create) VALUES($1);', [new Date()], function(res){
        console.log("res", res);
}, function(err){
    console.log("ERROR", err)
})

//var pg = new PG(function(){
//
//    pg.transact('INSERT INTO sites(date_create) VALUES($1);', [new Date()], function(res){
//        console.log("res", res);
//        pg.transact('INSERT INTO sites(date_create) VALUES($1);', [new Date()], function(res){
//            console.log("res", res);
//        }, function(err){
//            console.log("ERROR2", err)
//        }, true)
//    }, function(err){
//        console.log("ERROR1", err)
//    })
//}, function(err){
//    console.log("ERROR", err)
//})
//
//var params = require("./server/seo_parameters");
//
//var SeoParams = new params();
//
//function getData(obj) {
//    var out = '';
//    for (var j=0; j< obj.length; j++) {
//        if (obj[j].hasOwnProperty('children')) {
//            out += getData(obj[j].children);
//        }
//        if (obj[j].hasOwnProperty('data')) {
//            out += obj[j].data;
//        }
//    }
//    return out;
//}
//
//var obj = [
//    {children: [
//        {data: "data2"},
//        {data: "data3", children: []}
//    ]},
//    {data: "data5"},
//    {data: "data1", children: []}
//];
//console.log(getData(obj))
//console.log(SeoParams.averageMatch('Мама мыла раму голубой тряпкой', 'Мыла ли мама эту раму губкой, или чем-то другим?'))