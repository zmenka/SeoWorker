var request = require('request');
var tough = require('tough-cookie');
var fs = require('fs');
var path = require('path');
var SeoParser = require('./seo_parser')

function BunSearcher() {
    //console.log('BunSearcher init');
};


BunSearcher.prototype.getContentByUrl = function (url, captcha, cookies, client_headers, callback, errback) {
    _this = this;

    var delay = 500;//+ (Math.random() * 2500);

    setTimeout(function () {
        BunSearcher.lastCallTime = new Date();
        if (!url) {
            errback("Url is empty");
        }
        //добавим http
        if (url.indexOf("http") < 0) {
            url = "http://" + url;
        }

        console.log("searcher downloads ", url);

        var headers = {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
            'accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*',
            'content-type': 'application/json;charset=UTF-8',
            'connection': 'keep-alive',
            'accept-encoding': 'gzip,deflate,sdch',
            'accept-language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4'
        }
        if (client_headers) {
            console.log("добавлены заголовки пользователя", client_headers);
            headers['connection'] = client_headers['connection'];
            headers['accept'] = client_headers['accept'];
            headers['user-agent'] = client_headers['user-agent']
            headers['content-type'] = client_headers['content-type'];
            headers['accept-encoding'] = client_headers['accept-language-encoding'];
            headers['accept-language'] = client_headers['accept'];

//            headers['pragma'] = client_headers['pragma'];
//            headers['cache-control'] = client_headers['cache-control'];
//            headers['cookie'] = 'spravka=dD0xMzg0NTYzODY0O2k9MTg4LjIyNi4yLjE4Mjt1PTEzODQ1NjM4NjQyOTk5MzYzODA7aD1iNzFlMjZiMTI0NGIxZDI4MmQ3YWY0NjU3M2YwOTg0Nw==; yandexuid=4126777821416100044';
        }
        var j = request.jar()

        var options = {
            url: url,
            followAllRedirects: true,
            headers: headers,
            jar: j,
            timeout: 500
        };

        var properties = null;
        if (captcha && captcha.key && captcha.retpath && captcha.action && captcha.rep) {
            //properties = { 'key': encodeURIComponent(captcha.key), 'retpath': encodeURIComponent(captcha.retpath), 'rep': encodeURIComponent(captcha.rep) };
            options.url = 'http://yandex.ru/checkcaptcha?key='+encodeURIComponent(captcha.key)+'&retpath='
                +encodeURIComponent(captcha.retpath)+'&rep='+encodeURIComponent(captcha.rep);
        }
//        if (properties) {
//           // console.log("добавляем к запросу параметры капчи", properties);
//           options['qs'] = properties;
//
//           //options.url = 'http://yandex.ru' + captcha.action;
//        }

        if (cookies) {
            console.log("saved cookies", cookies)
            for (var i in cookies){

                j.setCookie(cookies[i].key + "=" + cookies[i].value, options.url);
            }
        }
//        j.setCookie("spravka=dD0xMzg0NTY3MDQ1O2k9MTg4LjIyNi4yLjE4Mjt1PTEzODQ1NjcwNDU5NzA5MDI3NzM7aD0zYjIxYmFlZGNmZjI3YTlmMzA5MjU0YTRhZWY5N2FiOA==; Expires=Tue, 16 Dec 2014 01:57:25 GMT; Domain=yandex.ru; Path=/; hostOnly=false; aAge=0ms; cAge=101ms", options.url)
//        j.setCookie("yandexuid=8076791051416103211; Expires=Wed, 13 Nov 2024 02:00:11 GMT; Domain=yandex.ru; Path=/; hostOnly=false; aAge=0ms; cAge=155ms", options.url)

        console.log("options", options)
        request(options, function (error, response, body) {
            if (error) {
                errback('Ошибка при получении html' + error.toString());
            } else {
                console.log("Содержимое сайте получено! ", response.request.url);//, body);
                console.log("response.headers", response.request.headers['cookie'])
                var cookies = j.getCookies(options.url)
                console.log("COOKIE", cookies)
                callback(body, cookies);

            }

        });
    }, delay);
};

BunSearcher.prototype.test = function (data, headers, callback, errback) {
    _this = this;

    _this.getContentByUrl(data.url, data.captcha, data.cookies, headers,
        function (raw_html, cookies) {

            //запишем в файл
            var fileDir = path.dirname(require.main.filename) + "/client/files/test/";
            //сделаем имя файлу
            var fileName = "test_captcha_" + new Date() + ".html";

            _this.getCaptcha(raw_html,
                function (captcha) {
                    fs.writeFile(fileDir + fileName, raw_html, function (err) {
                        if (err) {
                            errback("Ошибка при сохранении в файл " + err);
                        } else {
                            console.log("Файл сохранен в ", fileName);
                            if (captcha) {
                                callback({captcha: true, res: captcha, cookies: cookies});
                            } else {
                                console.log("капчи нет")
                                callback({captcha: false, res: raw_html, cookies: cookies});
                            }

                        }
                    });


                }, function (err) {
                    errback('getCaptcha:' + err.toString());
                })
        },
        function (error) {
            errback('getContentByUrl error:' + error.toString());
        })
};

BunSearcher.prototype.getCaptcha = function (raw_html, callback, errback) {
    var parser = new SeoParser();
    parser.initDom(raw_html,
        function () {
            var tags = parser.getByClassName('b-captcha');
            if (tags.length > 0) {
                var img = parser.getTag('.b-captcha .b-captcha__image');
                if (img.length == 1) {
                    //console.log('Img', img[0].attribs.src);
                    var key = parser.getTag('.b-captcha form input [name=key]');
                    //console.log('Key', key[0].attribs.value);
                    var retpath = parser.getTag('.b-captcha form input [name=retpath]');
                    //console.log('retpath', retpath[0].attribs.value);
                    var form = parser.getTag('.b-captcha form');
                    //console.log('form.action', form[0].attribs.action);

                    callback({
                        img: img[0].attribs.src,
                        key: key[0].attribs.value,
                        retpath: retpath[0].attribs.value,
                        action: form[0].attribs.action})
                    return;
                }
                console.log('Капча странная ');
                errback("problems with captcha", tags);
                return;
            }
            console.log("Капчи не нашлось")
            callback(null);
            return;
        }, function (err) {
            errback("parser.initDom error " + err);
        });

}

module.exports = BunSearcher;