var request = require('request');
var iconv = require('iconv-lite');
var path = require('path');
var SeoParser = require('./seo_parser')
var PgUsers = require('./db/postgres/pg_users')
var zlib = require('zlib');
var Q = require('q')
function Searcher() {
    //console.log('searcher init');
};

Searcher.lastCallTime = new Date();
Searcher.callInterval = 4000;

Searcher.prototype.getContentByUrl = function (url, captcha, client_headers, cookies) {
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

        if (!url) {
            deferred.reject("Searcher.prototype.getContentByUrl Url is empty");
        }

        //добавим http
        if (url.indexOf("http") < 0) {
            url = "http://" + url;
        }

        console.log("searcher downloads ", url);
        var contentTypes = ["text/html","text/plain","text/xml","application/json","application/xhtml+xml"]
        var headers = {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
            'accept': contentTypes.join(',') + ';*/*;q=0.8',
//            'content-type': 'text/html; charset=utf-8',
            'connection': 'keep-alive',
            'accept-encoding': 'gzip,deflate',
            'accept-language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
            'accept-charset': "ISO-8859-1,utf-8;q=0.7,*;q=0.3"
        }
        if (client_headers) {
            console.log("добавлены заголовки пользователя")//, client_headers);
//            headers['connection'] = client_headers['connection'];
//            headers['accept'] = client_headers['accept'];
            headers['user-agent'] = client_headers['user-agent'];
//            headers['content-type'] = client_headers['content-type'];
//            headers['accept-encoding'] = client_headers['accept-encoding'];
//            headers['accept-language'] = client_headers['accept-language'];
        }
        var j = request.jar()

        if (cookies) {
            console.log("saved cookies", cookies)
            for (var i in cookies) {
                j.setCookie(cookies[i].key + "=" + cookies[i].value, url);
            }
        }

        var options = {
            url: url,
            followAllRedirects: true,
            jar: j,
            timeout: 15000,
            encoding: null
        };

        options.headers = headers;

        var properties = null;
        if (captcha && captcha.key && captcha.retpath && captcha.action && captcha.rep) {
//            var str = String();
//            console.log('!!!!!!!', typeof(str))
//            str = (str).rep1ace(/amp;/g, '')
            //properties = { 'key': encodeURIComponent(captcha.key), 'retpath': encodeURIComponent(captcha.retpath), 'rep': encodeURIComponent(captcha.rep) };
            options.url = 'http://yandex.ru/checkcaptcha?key=' + encodeURIComponent(captcha.key) + '&retpath='
                + encodeURIComponent(captcha.retpath) + '&rep=' + encodeURIComponent(captcha.rep);
            console.log("ссылка на капчу ", options.url)

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
                
                
                if (checkArrElemIsSubstr(response.headers['content-type'],contentTypes)==-1){
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
    if (enc){
        enc = enc.toLowerCase();
        if (enc != 'utf-8' && enc != 'utf8') {
            body = iconv.decode(buf, enc)
        }
    }


    return body.toString();
}

function checkArrElemIsSubstr(rx, arr) {
	if (rx && arr){
		for (var i in arr) {
			if (rx.match(arr[i].toString())) {
				return i;
			}
		}
	}
	return -1;
};

Searcher.prototype.getContentByUrlOrCaptcha = function (url, captcha, client_headers, user_id) {
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
            return _this2.getContentByUrl(url, captcha, client_headers, cookies)
        })

        .then(function (res) {
            content = res
            return new PgUsers().updateCookies(user_id, JSON.stringify(res.cookies))
        })

        .then(function (res) {
            return _this2.getCaptcha(content.html)
        })
        .catch(function (error) {
            console.log(error.stack)
            throw 'getContentByUrlOrCaptcha error:' + error.toString();
        })
        .then(function (res) {
            if (res) {
                throw {captcha: res, cookies: content.cookies};
            } else {
                return content;
            }

        })

}

Searcher.prototype.getCaptcha = function (raw_html) {
    _this = this;
    var date = new Date()
    var parser = new SeoParser();
    return parser.initDomQ(raw_html)
        .then(function () {
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
                    console.log(-date.getTime() + (new Date().getTime()))
                    console.log('Капча!!!!');
                    return (
                    {
                        img: img[0].attribs.src,
                        key: key[0].attribs.value,
                        retpath: (retpath[0].attribs.value).replace(/&amp;/g, '&'),
                        action: form[0].attribs.action}
                        )
                }
                console.log('Капча странная ');
                throw "problems with captcha" + tags;
                return;
            }
            console.log(-date.getTime() + (new Date().getTime()))
            console.log("Капчи не нашлось")
            return null;
        })
        .catch(function (err) {
            throw "parser.initDom error " + err;
            return
        });
}

module.exports = Searcher;
