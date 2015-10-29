var Promise = require("../../server/utils/promise");

describe('Search', function () {

    it('проверяем что вывалится ошибка без кондишина', function () {
        var Updater = require("../../server/core/updater");
        return Updater.updateSearch()
            .then(function (res1) {
                throw('Не выпала ошибка!')
            })
            .catch(function (err) {
                console.log(err.stack)
            })
    })

    it('проверяем что вывалится ошибка если кондишн не существует', function () {
        var bad_cond_id = 8;
        var Updater = require("../../server/core/updater");
        return Updater.updateSearch(bad_cond_id)
            .then(function (res1) {
                throw('Не выпала ошибка!')
            })
            .catch(function (err) {
                console.log(err.stack)
            })
    })
    it('получаем поисковую выдачу', function () {
        var cond_id = 642;
        var Updater = require("../../server/core/updater");
        return Updater.updateSearch(cond_id)
            .then(function (res) {
                var fs = require('fs')
                fs.writeFileSync('/home/zmenka/1.json', JSON.stringify(res, null,2))
            })
            .catch(function (err) {
                console.error(err.stack)
                throw err
            })
    })

    it('Downloader.getContentByUrl pdf', function () {
        var Downloader = require("../../server/core/downloader");
        var url = 'http://accel.inp.nsk.su/library/nl7new.pdf';
        return Downloader.getContentByUrl(url)
            .then(function (res) {
                throw('Не выпала ошибка!')
            })
            .catch(function (err) {
                console.error('STACK', err.stack)
            })
    })

    it('Downloader.getContentByUrl', function () {
        var Downloader = require("../../server/core/downloader");
        //var url = 'https://github.com/petkaantonov/bluebird/blob/master/API.md#promiselongstacktraces---void';
        //var url = 'http://programmes.putin.kremlin.ru/amur_leopard/news/25198';
        //var url = 'rekaza.herokuapp.com';
        var url = 'http://www.velokat.su/';
        return Downloader.getContentByUrl(url)
            .then(function (res) {
                console.log('ugu', JSON.stringify(res, null,2))
            })
            .catch(function (err) {
                console.error('aga', err)
                console.error('aga STACK', err.stack)
            })
    })

    it('Downloader.getContentByUrlOrCAPTCHA MANY', function () {
        var Downloader = require("../../server/core/downloader");
        var url = 'http://yandex.ru/search/?text=sssk&lr=54';
        //return Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
        return Promise.all([
                Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
                Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
                Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
                Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),

         Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
            ])
            .then(function (res) {
                //console.log('ugu', JSON.stringify(res, null,2))
                console.log('ugu', res.length)
            })
            .catch(function (err) {
                console.error('aga', err)
                console.error('aga STACK', err.stack)
            })
    })

    it('Downloader.getContentByUrlOrCAPTCHA AND LINKS', function () {
        var Downloader = require("../../server/core/downloader");
        var SeoParameters = require("../../server/core/seo_parameters");
        var SearchUrlWithLinks = require("../../server/models/SearchUrlWithLinks");
        var url = 'http://yandex.ru/search/?text=sssk&lr=54';
        return Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
            .then(function (html) {
                return new SeoParameters(html)
            })
            .then(function (seoParameters) {
                return seoParameters.getSearchPicks('Yandex')
            })
            .then(function (res) {
                console.log('ugu', JSON.stringify(res, null,2))
                console.log('ugu', res.length)
            })
            .catch(function (err) {
                console.error('aga', err)
                console.error('aga STACK', err.stack)
            })
    })


    it('111', function () {
        var Antigate = require("../../server/core/antigate");
        var url = 'https://yandex.ru/captchaimg?aHR0cHM6Ly9pLmNhcHRjaGEueWFuZGV4Lm5ldC9pbWFnZT9rZXk9MjNuN1ZDbVd2cTU0NEJIb2JIdlNGOHg3UWNrVEpRQWE,_0/1446027521/bb4e6bc49817753e47c4475d2f45bfdc_be5198a0b35566d468d4cbc225495a63'
        var key = 'c63a84335b2b361d3bce05b80033e4b1'
        return Antigate(url, key)
            .then(function (res) {
                console.log('ugu', res)
            })
            .catch(function (err) {
                console.error('aga', err.stack)
                throw err
            })
    })
})


