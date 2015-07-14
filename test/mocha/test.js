/**
 * Created by zmenka on 28.02.15.
 */

var Q = require("q");

describe('Test', function () {
    describe('All', function () {

        it('search captcha', function () {

            var searcher = require("../../server/searcher")
            var html = '<html dir="LTR"><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"><meta name="viewport" content="initial-scale=1"><title>https://www.google.ru/search?q=how+to+get+captcha</title></head>                <body style="font-family: arial, sans-serif; background-color: #fff; color: #000; padding:20px; font-size:18px;" onload="e=document.getElementById(\'captcha\');if(e){e.focus();}">                <div style="max-width:400px;">                    <hr noshade="" size="1" style="color:#ccc; background-color:#ccc;"><br>                    Чтобы продолжить, введите указанные ниже символы:<br><br>                            <img src="/sorry/image?id=16408954300718570780&amp;hl=ru" border="1" alt="Включите отображение изображений"><br><br><form action="CaptchaRedirect" method="get"><input type="hidden" name="continue" value="https://www.google.ru/search?q=how+to+get+captcha"><input type="hidden" name="id" value="16408954300718570780"><input type="text" name="captcha" value="" id="captcha" size="12" style="font-size:16px; padding:3px 0 3px 5px; margin-left:0px;"><input type="submit" name="submit" value="Отправить" style="font-size:18px; padding:4px 0;"><br><br><br></form>                                <hr noshade="" size="1" style="color:#ccc; background-color:#ccc;">                                    <div style="font-size:13px;">                                        <b>Об этой странице</b><br><br>Мы зарегистрировали подозрительный трафик, исходящий из вашей сети. С помощью этой страницы мы сможем определить, что запросы отправляете именно вы, а не робот. <a href="#" onclick="document.getElementById(\'infoDiv\').style.display=\'block\';">Почему это могло произойти?</a><br><br>                                        <div id="infoDiv" style="display:none; background-color:#eee; padding:10px; margin:0 0 15px 0; line-height:1.4em;">                                        Эта страница отображается в тех случаях, когда автоматическими системами Google регистрируются исходящие из вашей сети запросы, которые нарушают <a href="//www.google.ru/policies/terms/">Условия использования</a>. Страница перестанет отображаться после того, как эти запросы прекратятся. До этого момента для использования служб Google необходимо проходить проверку по слову.<br><br>Источником запросов может служить вредоносное ПО, подключаемые модули браузера или скрипт, настроенный на автоматических рассылку запросов. Если вы используете общий доступ в Интернет, проблема может быть с компьютером с таким же IP-адресом, как у вас. Обратитесь к своему системному администратору. <a href="//support.google.com/websearch/answer/86640">Подробнее...</a><br><br>Проверка по слову может также появляться, если вы вводите сложные запросы, обычно распространяемые автоматизированными системами, или же вводите запросы очень часто.                                        </div><br>                                        IP-адрес: 188.226.2.182<br>Время: 2015-03-05T05:22:09Z<br>URL: https://www.google.ru/search?q=how+to+get+captcha<br>                                            </div></div>                                            </body></html>';
            return new searcher().getCaptcha(html, 'Google')
                .then(function (res) {
                    console.log(res);
                    if (!res.img) {
                        throw 'no img';
                    }
                })

        })

        it('start bg', function () {

            var core = require("../../server/core")
            return new core().bg()
                .then(function (res) {
                    console.log(res);

                })


        })

        it('calc params for condition_id', function () {
            var cond_id = 369;
            var url = "http://plitca.ru"
            var core = require("../../server/core")
            return new core().calcParams(cond_id, 1)
                .catch(function (err) {
                    console.log('Core.bg calcParams conds ', cond_id, ' , err ', err);
                    throw err;
                })
                .then(function (res1) {
                    return new core().calcParamsByUrl(url, cond_id)

                })
                .catch(function (err) {
                    console.log('Core.bg calcSiteParams conds ', url, cond_id, ' , err ', err);
                    throw err;
                })
        })

        it('search condition without params', function () {

            var PgConditions = require("../../server/db/postgres/pg_conditions")
            var PgSearch = require("../../server/db/postgres/pg_search")
            return new PgConditions().list()
                .then(function (res) {
                    var promises = [];
                    for (var i = 0; i < res.length; i++) {
                        promises.push((function (cond_id) {
                            return new PgSearch().listWithParams(cond_id)
                                .then(function (params_res) {
                                    console.log("condition ", cond_id, params_res.length)
                                    if (!params_res || params_res.length == 0) {
                                        throw 'Параметры выборки еще не расчитаны. ' + cond_id;

                                    }
                                })
                        })(res[i]["condition_id"]))
                    }
                    return Q.allSettled(promises)
                })
                .then(function (res) {
                    var r = res.filter(function (element) {
                        return element.state == 'rejected';
                    });
                    if (r.lenght > 0) {
                        throw r;
                    }
                })


        })

        it('search links from url', function () {

            var core = require("../../server/core")
            return new core().bg()
                .then(function (res) {
                    console.log(res);

                })


        })

        it('getLastNotSearchedRandomTask', function () {
            var PgConditions = require("../../server/db/postgres/pg_conditions")
            return new PgConditions().getLastNotSearchedRandomTask(50, new Date('2015-03-26'))
                .then(function (res) {
                    console.log(res);

                })

        })

        it('listWithParams', function () {
            var PgSearch = require("../../server/db/postgres/pg_search")
            return new PgSearch().listWithParams(50)
                .then(function (res) {
                    console.log(res);

                })
                .catch(function (err) {
                    console.log(err.stack);
                    console.log(err);
                })

        })

        it('get search links', function () {

            var Searcher = require("../../server/searcher")
            var SeoParameters = require("../../server/seo_parameters")
            var search_url = 'http://yandex.ru/yandsearch?lr=54&text=%D0%BF%D1%80%D0%BE%D0%B4%D0%B2%D0%B8%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0%20%D0%B2%20%D0%B5%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%D0%B5&p=0';
            return new Searcher().getContentByUrlOrCaptcha(search_url, null, 1, 'Yandex', true)
                .then(function (res) {
                    return new SeoParameters().getSearchPicks(res.html, 'Yandex')
                })
                .then(function (links) {
                    console.log(links);
                })

        })

        it('check manager', function () {

            var PgManager = require("../../server/db/postgres/pg_manager")
            return new PgManager().getCookieTaskUpdateTime()
                .then(function (date) {
                    if (date && (Math.abs(new Date("23 May 2015 10:12") - date) / 36e5) > 3) {
                        console.log('пора обновить!')
                        new PgManager().updateCookieTaskUpdateTime(new Date())
                    }

                })


        })


        it.only('search LINKS', function () {

            var SeoParameters = require("../../server/seo_parameters.js")
            //var Searcher = require("../../server/searcher.js")
            //var PgHtmls = require("../../server/db/postgres/pg_htmls.js")
            //var url = 'http://yandex.ru/yandsearch?lr=54&text=%D0%BF%D1%80%D0%BE%D0%B4%D0%B2%D0%B8%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D1%81%D0%B0%D0%B9%D1%82%D0%B0&p=0'
            //return new Searcher().getContentByUrlOrCaptcha(url, null, 1, 'Yandex', true)
            //    .then(function (res) {
            //        var raw_html = res.html;
            //        return new  SeoParameters().getSearchPicks(raw_html, 'Yandex')
            // })
            // .then(function (links) {
            //        console.log(JSON.stringify(links, null, 2) )
            //        console.log(links.length)
            // })
            //
            var cheerio = require('cheerio')

            raw_html = '<html>' +
                '<h2>' +
                '<span><a href = "test.url1" >TITLE1</a></span>' +
                '<a href = "test.url2" >TITLE2</a>' +
                '</h2>' +
                '</html>'

            $ = cheerio.load(raw_html);
            $('h2 > a').each(function(i, elem) {
                console.log('qwe',$(this).text());
            });
            console.log('asd', $('html').length)
            //return new  SeoParameters().getSearchPicks(raw_html, 'Yandex')
            //    .then(function (links) {
            //        console.log(JSON.stringify(links, null, 2) )
            //    })

        })

    })
})


