var request = require('request');
var iconv = require('iconv-lite');
var path = require('path');
var SeoParser = require('./seo_parser')
var PgUsers = require('./db/postgres/pg_users')
var zlib = require('zlib');
var Q = require('q')
var he = require('he');
function Searcher() {
    //console.log('searcher init');
};

Searcher.lastCallTime = new Date();
Searcher.callInterval = 4000;

Searcher.prototype.getContentByUrl = function (url, captcha, cookies) {
    var date = new Date()
    var deferred = Q.defer();
    var diffDates = new Date().getTime() - Searcher.lastCallTime.getTime();
    var timerInterval = 10;
    console.log("diffDates", diffDates);
//    if (diffDates < Searcher.callInterval) {
//        console.log("ждем, слишком часто вызываем запросы на скачивание сайтов");
//        timerInterval = Searcher.callInterval - diffDates;
//
//    }

    setTimeout(function () {
        Searcher.lastCallTime = new Date();



        console.log("searcher downloads ", url);
        var contentTypes = ["text/html", "text/plain", "text/xml", "application/json", "application/xhtml+xml"]
        var headers = {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
            'accept': contentTypes.join(',') + ';*/*;q=0.8',
//            'content-type': 'text/html; charset=utf-8',
            'connection': 'keep-alive',
            'accept-encoding': 'gzip,deflate',
            'accept-language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'accept-charset': "ISO-8859-1,utf-8;q=0.7,*;q=0.3"
        }

        var j = request.jar()

//        if (cookies) {
//            console.log("saved cookies", cookies)
//            for (var i in cookies) {
//                j.setCookie(cookies[i].key + "=" + cookies[i].value, url);
//            }
//        }

        var options = {
            followAllRedirects: true,
            jar: j,
            timeout: 15000,
            encoding: null
        };

        options.headers = headers;

        if (!url && !captcha) {
            deferred.reject("Searcher.prototype.getContentByUrl Url and captcha is empty");
        }

        if (url){
            //добавим http
            if (url.indexOf("http") < 0) {
                url = "http://" + url;
            }
            options.url = url;
        }

        if (captcha ){
            options.url = captcha;
        }


//        j.setCookie("spravka=dD0xMzg0NTY3MDQ1O2k9MTg4LjIyNi4yLjE4Mjt1PTEzODQ1NjcwNDU5NzA5MDI3NzM7aD0zYjIxYmFlZGNmZjI3YTlmMzA5MjU0YTRhZWY5N2FiOA==; Expires=Tue, 16 Dec 2014 01:57:25 GMT; Domain=yandex.ru; Path=/; hostOnly=false; aAge=0ms; cAge=101ms", options.url)
//        j.setCookie("yandexuid=8076791051416103211; Expires=Wed, 13 Nov 2024 02:00:11 GMT; Domain=yandex.ru; Path=/; hostOnly=false; aAge=0ms; cAge=155ms", options.url)

        request(options, function (error, response, body) {
            if (error) {
                deferred.reject('Searcher.prototype.getContentByUrl Ошибка при получении html ' + error.toString());
            } else {

                var cookies = j.getCookies(options.url)
                console.log("Содержимое сайте получено: ", options.url)
                console.log("cookies", cookies)


                if (checkArrElemIsSubstr(response.headers['content-type'], contentTypes) == -1) {
                    deferred.reject('Searcher.prototype.getContentByUrl Мы не знаем такой content type: ' + response.headers['content-type']);
                }
                var encoding = response.headers['content-encoding'];
                console.log("encoding", encoding)
                if (encoding == 'gzip') {

                    zlib.gunzip(body, function (err, decoded) {
                        if (error) {
                            deferred.reject('Searcher.prototype.getContentByUrl Ошибка при получении zlib ' + err.toString());
                        }

                        deferred.resolve({html: responseDecode(response, decoded), cookies: cookies});
                    });
                } else if (encoding == 'deflate') {
                    zlib.inflate(body, function (err, decoded) {
                        if (error) {
                            deferred.reject('Searcher.prototype.getContentByUrl Ошибка при получении zlib ' + err.toString());
                        }

                        deferred.resolve({html: responseDecode(response, decoded), cookies: cookies});
                    })
                } else {
                    deferred.resolve({html: responseDecode(response, body), cookies: cookies});
                }


            }
            console.log(-date.getTime() + (new Date().getTime()))
        })


    }, timerInterval);
    return deferred.promise;
};

function responseDecode(response, body) {
//    var buf = new Buffer(body, 'binary')
    var buf = body;
    var charset = require('charset'),
        jschardet = require('jschardet');

    var enc = charset(response.headers, buf);
    enc = enc || jschardet.detect(buf).encoding;

    console.log('encoding charset', enc)
    if (enc) {
        enc = enc.toLowerCase();
        if (enc != 'utf-8' && enc != 'utf8') {
            try {
                body = iconv.decode(buf, enc);
            } catch (e) {
                console.log("decode error", e);
            }

        }
    }
    return he.decode(body.toString());
}

function checkArrElemIsSubstr(rx, arr) {
    if (rx && arr) {
        for (var i in arr) {
            if (rx.match(arr[i].toString())) {
                return i;
            }
        }
    }
    return -1;
};

Searcher.prototype.getContentByUrlOrCaptcha = function (url, captcha, user_id,sengine_name) {
    _this2 = this;
    var content
    return new PgUsers().get(user_id)
        .then(function (res) {
            var cookies;
            try {
                cookies = JSON.parse(res.cookies)
            }
            catch (err) {
                cookies = null
            }
            return _this2.getContentByUrl(url, captcha, cookies)
        })

        .then(function (res) {
            content = res
            return new PgUsers().updateCookies(user_id, JSON.stringify(res.cookies))
        })

        .then(function (res) {
            return _this2.getCaptcha(url, content.html,sengine_name)
        })
        .catch(function (error) {
            console.log(error.stack)
            throw 'getContentByUrlOrCaptcha error:' + error.toString();
        })
        .then(function (rescaptcha) {
            if (rescaptcha) {
                return this.getContentByUrlOrCaptcha(null , rescaptcha, user_id);
            } else {
                return content;
            }

        })

}

Searcher.prototype.getCaptcha = function (url, raw_html,sengine_name) {
    _this = this;
    var date = new Date()
    var parser = new SeoParser();
    return parser.initDomQ(raw_html)
        .then(function () {
            if (sengine_name == 'Yandex') {

            var tags1 = parser.getTag('form[action=/checkcaptcha]');
            if (tags1.length > 0) {
                var img = parser.getTag('form[action=/checkcaptcha] img');

                if (img.length >= 1) {
                    var img = img[0].attribs.src;

                    var key = parser.getTag('form[action=/checkcaptcha] input[name=key]');
//                    console.log('Key', key[0].attribs.value);
                    var retpath = parser.getTag('form[action=/checkcaptcha] input[name=retpath]');
//                    console.log('retpath', retpath.attribs.value);
                    var rep = 'qwe';
                    console.log(-date.getTime() + (new Date().getTime()));
                    console.log('Капча!!!!');
                    var kaptcha = 'http://yandex.ru/checkcaptcha?key='
                        + encodeURIComponent(key) +
                        '&retpath=' + encodeURIComponent(retpath) +
                        '&rep=' + encodeURIComponent(rep);
//                    console.log(kaptcha);
                    return kaptcha;
                }
                console.log('Капча странная ');
                throw "problems with yandexcaptcha" + tags;
                return;

            }

            console.log(-date.getTime() + (new Date().getTime()))
            console.log("Капчи не нашлось")
            return null;
        } else if (sengine_name=='Google'){
                var tags1 = parser.getTag('form[action=CaptchaRedirect]');
                if (tags1.length > 0) {
                    var img = parser.getTag('img');

                    if (img.length >= 1 ){//&& img[0].attribs.src.substr(0,7) == '/sorry/') {
                        var img = img[0].attribs.src;

                        var continue1 = parser.getTag('form[action=CaptchaRedirect] input[name=continue]');
                        var id = parser.getTag('form[action=CaptchaRedirect] input[name=id]');
                        var captcha = '';
                        console.log(-date.getTime() + (new Date().getTime()));
                        console.log('Капча!!!!');
                        var kaptcha = 'http://ipv4.google.com/sorry/CaptchaRedirect?"' +
                            'continue=' + encodeURIComponent(continue1) +
                            '&id=' + encodeURIComponent(id) +
                            '&captcha=' + encodeURIComponent(captcha);
                        return kaptcha;
                    }
                    console.log('Капча странная ');
                    throw "problems with captcha" + tags;
                    return;

                }

                console.log(-date.getTime() + (new Date().getTime()))
                console.log("Капчи не нашлось")
                return null;
            } else {
                throw 'Не известный поисковик для получения капчи'
            }
        })
        .catch(function (err) {
            throw "Searcher.prototype.getCaptcha error " + err;
            return
        });
}

module.exports = Searcher;
