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

//var PG = require("./server/db/postgres/pg");

var PgUsurls     = require("./server/db/postgres/pg_usurls");
var PgUrls       = require("./server/db/postgres/pg_urls");
var PgUsers      = require("./server/db/postgres/pg_users");
var PgTasks      = require("./server/db/postgres/pg_tasks");
var PgSengines   = require("./server/db/postgres/pg_sengines");
var PgSearch     = require("./server/db/postgres/pg_search");
var PgScontent   = require("./server/db/postgres/pg_scontents");
var PgRoles      = require("./server/db/postgres/pg_roles");
var PgParams     = require("./server/db/postgres/pg_params");
var PgHtmls      = require("./server/db/postgres/pg_htmls");
var PgConditions = require("./server/db/postgres/pg_conditions");

var pgusurls     = new PgUsurls    ();
var pgurls       = new PgUrls    ();
var pgusers      = new PgUsers     ();
var pgtasks      = new PgTasks     ();
var pgsengines   = new PgSengines  ();
var pgsearch     = new PgSearch    ();
var pgscontent   = new PgScontent  ();
var pgroles      = new PgRoles     ();
var pgparams     = new PgParams    ();
var pghtmls      = new PgHtmls     ();
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
pgconditions.getCurrentSearchPage(1, new Date())//53

    .then(function(params){
//        console.log(domUtils.getElementsByTagName("div"))
        console.log(params)
    })
    .catch(function(err){
        console.log(err)
    });

console.log(new Date().toISOString());
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
