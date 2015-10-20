var Promise = require("../../server/utils/promise");

describe('Search', function () {

    it('проверяем что вывалится ошибка без кондишина', function () {
        var Searcher = require("../../server/core/searcher");
        return Searcher.doSearch()
            .then(function (res1) {
                throw('Не выпала ошибка!')
            })
            .catch(function (err) {
                console.log(err.stack)
            })
    })

    it('проверяем что вывалится ошибка если кондишн не существует', function () {
        var bad_cond_id = 8;
        var Searcher = require("../../server/core/searcher");
        return Searcher.doSearch(bad_cond_id)
            .then(function (res1) {
                throw('Не выпала ошибка!')
            })
            .catch(function (err) {
                console.log(err.stack)
            })
    })
    it.only('получаем поисковую выдачу', function () {
        var cond_id = 642;
        var Searcher = require("../../server/core/searcher");
        return Searcher.doSearch(cond_id)
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


