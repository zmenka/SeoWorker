var http = require("http");
var request = require('request');
var fs = require('fs');
var path = require('path');

var Site = require("./db/site");

function Searcher() {
    console.log('searcher init');
};

Searcher.prototype.saveSite = function (url, callback, errback) {

    this.url = url;
    if (!url) {
        errback("Url is empty");
    }
    //добавим http
    if (url.indexOf("http") < 0) {
        url = "http://" + url;
    }

    console.log("searcher downloads ", url);

    var options = {
        url: url,
        followAllRedirects: true,
        headers: {
            'User-Agent':  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Charset':'utf-8;q=0.7,*;q=0.5',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'deflate',
            'Accept-Language':	'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
        }
    };

    var date_create = Date.now();

    request(options, function (error, response, body) {
        if (error) {
            errback('Ошибка при получении html' + error.toString());
        } else {
            console.log("Содержимое сайте получено! ", body);

            //запишем в файл
            var fileDir = path.dirname(require.main.filename) + "/client/files/";
            //сделаем нормальное имя файлу
            var fileName = url.replace(/(http|https\\|\/|\?|:|\*|"|'|>|<|\|)/g, '').substr(0,15) + "_" + date_create + ".html";
            fs.writeFile(fileDir + fileName, body, function (err) {
                if (err) {
                    errback("Ошибка при сохранении в файл " + err);
                } else {
                    console.log("Файл сохранен в ", fileName);
                    // create a Site
                    Site.create({
                        url: url,
                        raw_html: body,
                        date_create: date_create,
                        path: fileName
                    }, function (err, site) {
                        if (err) {
                            errback("Ошибка при сохранении в монгу" + err);
                        } else {
                            console.log("Новый объект сохранен в монгу");
                            callback();
                        }
                    });
                }
            });
        }

    });

};

module.exports = Searcher;