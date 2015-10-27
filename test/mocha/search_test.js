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

    it('Downloader.getContentByUrlOrCAPTCHA', function () {
        var Downloader = require("../../server/core/downloader");
        var url = 'https://yandex.ru/search/?lr=54&text=%D0%BF%D0%BE%D0%B3%D0%BE%D0%B4%D0%B0%20%D0%B2%20%D0%B5%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%D0%B5%20%D0%BD%D0%B0%2010%20%D0%B4%D0%BD%D0%B5%D0%B9';
        return Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
        //return Promise.all([
        //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
        //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
        //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
        //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
        //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
        //    ])
            .then(function (res) {
                console.log('ugu', JSON.stringify(res, null,2))
                console.log('ugu', res.length)
            })
            .catch(function (err) {
                console.error('aga', err)
                console.error('aga STACK', err.stack)
            })Searcher.getLinksFromSearcher
    })

    it.only('ыуфксрук A', function () {
        var Downloader = require("../../server/core/downloader");
        var url = 'https://yandex.ru/search/?lr=54&text=%D0%BF%D0%BE%D0%B3%D0%BE%D0%B4%D0%B0%20%D0%B2%20%D0%B5%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%D0%B5%20%D0%BD%D0%B0%2010%20%D0%B4%D0%BD%D0%B5%D0%B9';
        return Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
            //return Promise.all([
            //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
            //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
            //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
            //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),
            //        Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true),Downloader.getContentByUrlOrCaptcha(url, null, 'Yandex', true)
            //    ])
            .then(function (res) {
                console.log('ugu', JSON.stringify(res, null,2))
                console.log('ugu', res.length)
            })
            .catch(function (err) {
                console.error('aga', err)
                console.error('aga STACK', err.stack)
            })Searcher.getLinksFromSearcher
    })

    it('111', function () {
        var Downloader = require("../../server/core/downloader");
        return Downloader.antigateBalance()
            .then(function (res) {
                console.log('ugu', res)
            })
            .catch(function (err) {
                console.error('aga', err.stack)
                throw err
            })
    })
})


