//var BunSearcher = require("./server/bun_searcher");
//var fileName = path.dirname(require.main.filename) + "/client/files/CAPTCHA/0.html";
//fs.readFile(fileName, function (err, data) {
//    if (err) throw 'Ошибка при чтении файла ' + err;
//    new BunSearcher().checkCaptcha(data)
//})
//new BunSearcher().sendCaptcha({}, function (res) {
//    console.log('res')
//
//}, function (err) {
//    console.log(err)
//})

var PG = require("./server/db/postgres/pg");

var PgUsurls = require("./server/db/postgres/pg_usurls");
var PgUrls = require("./server/db/postgres/pg_urls");
var PgUsers = require("./server/db/postgres/pg_users");
var PgTasks = require("./server/db/postgres/pg_tasks");
var PgSengines = require("./server/db/postgres/pg_sengines");
var PgSearch = require("./server/db/postgres/pg_search");
var PgScontent = require("./server/db/postgres/pg_scontents");
var PgRoles = require("./server/db/postgres/pg_roles");
var PgParams = require("./server/db/postgres/pg_params");
var PgHtmls = require("./server/db/postgres/pg_htmls");
var PgConditions = require("./server/db/postgres/pg_conditions");

var pgusurls = new PgUsurls();
var pgurls = new PgUrls();
var pgusers = new PgUsers();
var pgtasks = new PgTasks();
var pgsengines = new PgSengines();
var pgsearch = new PgSearch();
var pgscontent = new PgScontent();
var pgroles = new PgRoles();
var pgparams = new PgParams();
var pghtmls = new PgHtmls();
var pgconditions = new PgConditions();
/*
 pgroles.list(
 function(res){
 r = res;
 console.log('res');
 console.log(res);
 },
 function(err){
 console.log('err');
 console.log(err);

 }); */
//получить все строки из roles
/*
 pgusers.insert(
 'user_login',
 'user_password',
 1,
 'user_fname',
 'user_iname',
 'user_oname',
 'user_email',
 'user_phone',
 function(res){
 r = res;
 console.log('res');
 console.log(res);
 },
 function(err){
 console.log('err');
 console.log(err);
 });
 */
//pgusers.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgurls.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgusurls.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pghtmls.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgtasks.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgparams.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgconditions.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgsearch.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//pgscontent.list( function(res){r = res;console.log('res');console.log(res);}, function(err){console.log('err'); console.log(err);});
//var SeoParameters = require("./server/seo_parameters")
//var domUtils = require("htmlparser").DomUtils;
//pghtmls.get(159)//53
//    .then(function(res){
//        console.log("html_id", res.html_id)
//        return new SeoParameters().init("test", "yandex",res.html )
//    })
//    .then(function(params){
////        console.log(domUtils.getElementsByTagName("div"))
//        console.log(params.getTag("a"))
//    })
//    .catch(function(err){
//        console.log(err)
//    });
//pgconditions.getCurrentSearchPage(1, new Date())//53
//
//    .then(function(params){
////        console.log(domUtils.getElementsByTagName("div"))
//        console.log(params)
//    })
//    .catch(function(err){
//        console.log(err)
//    });
//
//console.log(new Date().toISOString());
//var PG = require("./server/db/postgres/pg");
//
//PG.query('INSE123RT INTO sites(date_create) VALUES($1);', [new Date()], function(res){
//        console.log("res", res);
//}, function(err){
//    console.log("ERROR", err)
//})

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

//
//var db;
//var urls
//return new PG()
//    .then(function (db_res) {
//        db = db_res
//        return db.transact(
//            "INSERT INTO urls (url, date_create) VALUES ($1, $2);",
//            ['qwe', new Date()])
//    })
//    .then(function (res) {
//        return db.transact(
//            "SELECT currval(pg_get_serial_sequence('urls','url_id'))",
//            [], true)
//    })
//    .then(function (res) {
//        console.log("url saved", res.rows[0].currval);
//        return res.rows[0].currval;
//    })
//    .catch(function (err) {
//        console.log(err)
//        throw 'PgUsurls.prototype.insert ' + err;
//
//    });
//var bcrypt   = require('bcrypt-nodejs');
//console.log(bcrypt.hashSync('seoTest', bcrypt.genSaltSync(8), null));

var SeoParser = require("./server/seo_parser");
var parser = new SeoParser();
//new PgHtmls().get(668)
//    .then(function (res) {
//        console.log('html получен', res);
//        parser.initDom(res.html,
//            function (){
//                console.log(parser.getTag('div h1'))
//            },
//            function (err){
//                console.log(err)
//            });
//    })
//    .catch(function (err) {
//        console.log(err)
//    });

var Searcher = require('./server/searcher')
new Searcher().getContentByUrl('http://akulaweb.ru/')
    .then(function (res) {
        console.log(res)
    })

var iconv = require('iconv-lite');
var request = require('request');
request({
        url:'http://akulaweb.ru/',
        encoding: null
    },
    function(err, resp, body){
        var bodyWithCorrectEncoding = iconv.decode(body, 'utf-8');
        console.log('iconv-lite', body);
    }
);

