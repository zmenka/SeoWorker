var iconv = require('iconv-lite');
var path = require('path');
var SeoParser = require('./seo_parser');
var PgUsers = require('./../db/models/pg_users');

var Promise = require('../utils/promise');
var request = Promise.promisify(require("request"));
var zlib_gunzip = Promise.promisify(require('zlib').gunzip);
var zlib_inflate = Promise.promisify(require('zlib').inflate);
var he = require('he');
var Antigate = require('antigate');
var config = require('./../config');
var ag = new Antigate(config.antigate_key);
var charset = require('charset');
var jschardet = require('jschardet');

var Downloader = {};

Downloader._contentTypes = ["text/html", "text/plain", "text/xml", "application/json", "application/xhtml+xml"]
Downloader._headers = {
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
    'accept': Downloader._contentTypes.join(',') + ';*/*;q=0.8',
    'connection': 'keep-alive',
    'accept-encoding': 'gzip,deflate',
    'accept-language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
    'accept-charset': "ISO-8859-1,utf-8;q=0.7,*;q=0.3"
};

Downloader.getOptions = function (url, cookies) {
    if (!url) {
        throw new Error("Url is empty");
    }

    var options = {
        followAllRedirects: true,
        timeout: 25000,
        encoding: null,
        headers: Downloader._headers
    };

    if (url.indexOf("http") < 0) {
        url = "http://" + url;
    }
    options.url = url;

    var j = request.jar();

    //используем куки
    if (cookies) {
        for (var i in cookies) {
            j.setCookie(cookies[i].key + "=" + cookies[i].value, options.url);
        }
    }
    options.jar = j;
    return options;
};
/**
 * @param url
 * @param cookies
 * @returns {html: string, cookies: Object[]}
 */
Downloader.getContentByUrl = function (url, cookies) {
    return Promise.try(function () {
        var options = Downloader.getOptions(url, cookies);
        return request(options)
            .then(function (res) {
                var response = res[0]
                var body = res[1]
                if (!response) {
                    throw new Error('response empty for ' + url);
                }
                if (!body) {
                    throw new Error('body empty for ' + url);
                }
                if (response.headers['content-type'] && checkArrElemIsSubstr(response.headers['content-type'], Downloader._contentTypes) == -1) {
                    throw new Error('Мы не знаем такой content type: ' + response.headers['content-type']);
                }
                var j = options.jar;
                var cookies = j.getCookies(options.url);

                return Downloader.responseDecompress(response.headers['content-encoding'], body)
                    .then(function (decompressed) {
                        return Downloader.responseDecode(response, decompressed)
                    })
                    .then(function (decoded) {
                        if (!decoded) {
                            throw new Error('decoded empty for ' + url);
                        }
                        return {html: decoded, cookies: cookies}
                    })
            })

    })
};

Downloader.responseDecompress = function (encoding, body) {
    return Promise.try(function () {
        if (!body) {
            throw new Error('Пустой body. ');
        }
        switch (encoding) {
            case 'gzip':
                return zlib_gunzip(body)
            case 'deflate':
                return zlib_inflate(body)
            default :
                return body
        }
    })
}


Downloader.responseDecode = function (response, body) {
    if (!response) {
        throw new Error('Пустой response. ');
    }
    if (!body) {
        throw new Error('Пустой body. ');
    }
    var enc = charset(response.headers, body);
    enc = enc || jschardet.detect(body).encoding;
    if (enc) {
        enc = enc.toLowerCase();
        return iconv.decode(body, enc);
    } else {
        throw new Error('Unknown encoding ');
    }
}

//возвращает номер элемента из массива  строк arr, для которого rx является подстрокой. Или -1.
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

Downloader.getContentByUrlOrCaptcha = function (url, cookies, sengine_name, restartIfCaptcha) {
    var content;
    return Promise.try(function(){
        if (cookies){
            return cookies
        } else {
            return PgUsers.get(1)
                .then(function (res) {
                    var cookies;
                    try {
                        cookies = JSON.parse(res.cookies)
                    }
                    catch (err) {
                    }
                    return cookies
                })
        }
        return cookies
    })
        .then(function (cookie_res) {
            return Downloader.getContentByUrl(url, cookie_res)
        })
        .then(function (res) {
            content = res;
            return PgUsers.updateCookies(1, JSON.stringify(content.cookies))
        })
        .then(function () {
            return Downloader.getCaptcha(content.html, sengine_name)
        })
        .then(function (rescaptcha) {
            if (rescaptcha) {
                if (restartIfCaptcha) {
                    return Downloader.getContentByUrlOrCaptcha(rescaptcha, content.cookies, sengine_name, false);
                } else {
                    throw new Error('получили капчу опять!')
                }

            } else {
                return content.html;
            }

        })

}

/**
 * @param raw_html
 * @param sengine_name
 *
 * @returns url с капчей или пусто, если капчи нет
 */
Downloader.getCaptcha = function (raw_html, sengine_name) {
    var _this = this;
    if (!raw_html) {
        return Promise.reject(new Error(' Не получено содержимой страницы!'));
    }

    return new SeoParser(raw_html)
        .then(function (parser) {
            if (sengine_name == 'Yandex') {

                var tags1 = parser.getTag('form[action=/checkcaptcha]');
                if (tags1.length > 0) {
                    var img = parser.getTag('form[action=/checkcaptcha] img');

                    if (img.length >= 1) {
                        var img = img[0].attribs.src;
                        var key = parser.getTag('form[action=/checkcaptcha] input[name=key]')[0].attribs.value;
                        var retpath = parser.getTag('form[action=/checkcaptcha] input[name=retpath]')[0].attribs.value;

                        console.error("CAPTCHA", img)
                        return Downloader.antigate(img)
                            .then(function (res) {
                                var kaptcha = 'http://yandex.ru/checkcaptcha?key='
                                    + encodeURIComponent(key) +
                                    '&retpath=' + encodeURIComponent(retpath) +
                                    '&rep=' + encodeURIComponent(res);

                                return kaptcha;
                            })

                    }
                    throw new Error(" problems with yandexcaptcha");
                }
                return;
            } else if (sengine_name == 'Google') {
                var tags1 = parser.getTag('form[action=CaptchaRedirect]');

                if (tags1.length > 0) {
                    var img = parser.getTag('img');

                    if (img.length >= 1) {
                        var img = img[0].attribs.src;
                        var continue1 = parser.getTag('form[action=CaptchaRedirect] input[name=continue]')[0].attribs.value;
                        var id = parser.getTag('form[action=CaptchaRedirect] input[name=id]')[0].attribs.value;

                        console.error("CAPTCHA", img)
                        return Downloader.antigate(img)
                            .then(function (res) {
                                var kaptcha = 'http://ipv4.google.com/sorry/CaptchaRedirect?"' +
                                    'continue=' + encodeURIComponent(continue1) +
                                    '&id=' + encodeURIComponent(id) +
                                    '&captcha=' + encodeURIComponent(res);
                                return kaptcha;
                            })
                    }
                    throw new Error("Downloader.getCaptcha problems with captcha" + tags);
                }
                return;
            } else {
                throw new Error('Downloader.getCaptcha Не известный поисковик для получения капчи')
            }
        })
}

Downloader.antigate = function (url) {
    return new Promise(function (resolve, reject) {
        ag.processFromURL(url, function (error, text, id) {
            if (error) {
                reject(error);
            } else {
                console.log('Antigate DONE', url, text);
                resolve(text);
            }
        });
    })
}

Downloader.antigateBalance = function () {
    return new Promise(function (resolve, reject) {
        ag.getBalance( function (error, text) {
            if (error) {
                reject(error);
            } else {
                resolve(text);
            }
        });
    })
}

module.exports = Downloader;
