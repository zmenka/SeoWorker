var http = require("http");
var request = require('request');
var fs = require('fs');
var path = require('path');

var Site = require("./db/site");

function Searcher() {
    console.log('searcher init');
};

Searcher.prototype.saveSite = function (url, callback, errback) {

        console.log("searcher downloads ", url);
        this.url = url;
        if (!url) {
            errback("Url is empty");
        }
        // скачиваем по адресу html
        var options = {
            host: url,
            port: 80,
            path: "/"
        };
        var content = "";
        var date_create = Date.now();




        var req1 = http.request(options, function (res1) {
            res1.setEncoding("utf8");
            res1.on("data", function (chunk) {
                content += chunk;
            });

            res1.on("end", function () {
                console.log("содержимое сайте получено! ", content);

                //запишем в файл
                var fileDir = path.dirname(require.main.filename) + "/client/files/";
                var fileName = url + "_" + date_create + ".html";
                fs.writeFile(fileDir + fileName, content, function (err) {
                    if (err) {
                        errback("Ошибка при сохранении в файл" + err);
                    } else {
                        console.log("The file was saved in ", fileName);
                        // create a Site
                        Site.create({
                            url: url,
                            raw_html: content,
                            date_create: date_create,
                            path: fileName
                        }, function (err, site) {
                            if (err) {
                                errback( "Ошибка при сохранении в монгу" + err);
                            } else {
                                console.log("The site was saved in mongo");
                                callback();
                            }
                        });
                    }
                });


            });
        });

        req1.end();
        req1.on('error', function (e) {
            errback('error when download html' + e.toString());
        });

};

module.exports = Searcher;