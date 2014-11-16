var request = require('request');

function Searcher() {
    console.log('searcher init');
};

Searcher.lastCallTime = new Date();
Searcher.callInterval = 4000;

Searcher.prototype.getContentByUrl = function (url, callback, errback) {
    var diffDates = new Date().getTime() - Searcher.lastCallTime.getTime();
    var timerInterval = 0;
    console.log("diffDates", diffDates);
    if (diffDates < Searcher.callInterval ) {
        console.log("ждем, слишком часто вызываем запросы к бд");
        timerInterval = Searcher.callInterval - diffDates;

    }

    setTimeout(function () {
        Searcher.lastCallTime = new Date();

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
                 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Charset': 'utf-8;q=0.7,*;q=0.5',
                'Connection': 'keep-alive',
                'Accept-Encoding': 'deflate',
                'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
            }
        };
        request(options, function (error, response, body) {
            if (error) {
                errback('Ошибка при получении html' + error.toString());
            } else {
                console.log("Содержимое сайте получено! ");//, body);
                callback(body);
            }

        });
    }, timerInterval);

};

module.exports = Searcher;