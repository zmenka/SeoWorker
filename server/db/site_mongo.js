/**
 * Created by zmenka on 29.09.14.
 */
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

function SiteMongo() {

};

// define model =================
SiteMongo.model = mongoose.model('Site', {
    url: String,
    raw_html: String,
    date_create: Date,
    path: String
});


SiteMongo.prototype.saveSite = function (url, raw_html, callback, errback) {

    var date_create = Date.now();

    //запишем в файл
    var fileDir = path.dirname(require.main.filename) + "/client/files/";
    //сделаем нормальное имя файлу
    var fileName = url.replace(/(http|https\\|\/|\?|:|\*|"|'|>|<|\|)/g, '').substr(0,15) + "_" + date_create + ".html";
    fs.writeFile(fileDir + fileName, raw_html, function (err) {
        if (err) {
            errback("Ошибка при сохранении в файл " + err);
        } else {
            console.log("Файл сохранен в ", fileName);
            // create a Site
            SiteMongo.model.create({
                url: url,
                raw_html: raw_html,
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

SiteMongo.prototype.getSites = function (callback, errback) {
    SiteMongo.model.find({}).sort({"date_create": -1}).exec(function (err, sites) {

        if (err) {
            errback(err);
        }
        else {
            callback(sites);
        }

    });
}

SiteMongo.prototype.getSite = function (id, callback, errback) {
    SiteMongo.model.findById(id, function (err, site) {
        if (err) {
            errback(err);
        } else {
            callback(site);
        }
    });

}

module.exports = SiteMongo;
