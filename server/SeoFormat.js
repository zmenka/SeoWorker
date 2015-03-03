var TaskTreeNode = require("./models/TaskTreeNode.js");

function SeoFormat() {
    //console.log('SeoFormat init');
};

SeoFormat.prototype.createSiteTree = function (sites) {
    if (!sites || sites.length == 0) {
        return [];
    }
    var tree = [];

    for (var i = 0; i < sites.length; i++) {
        var site = sites[i];
        //console.log("site", site);
        var domen = site.url.match(/(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)/)[1].toLowerCase();
        //console.log("domen", domen);

        var domens = tree.filter(function (v) {
            return v.title === domen;
        })

        var domenNode;
        if (domens.length > 0) {
            domenNode = domens[0];
        } else {
            domenNode = new TaskTreeNode();
            domenNode.create(domen, true,
                {title: site.url, usurl_id: site.usurl_id, url_id: site.url_id}, 'domen');
            tree.push(domenNode)
        }

        var pages = domenNode.nodes.filter(function (v) {
            return v.title === site.url;
        })

        var page;
        if (pages.length > 0) {
            page = pages[0];
        } else {
            page = new TaskTreeNode();
            page.create(site.url, true,
                {title: site.url, usurl_id: site.usurl_id, url_id: site.url_id}, 'page');
            domenNode.nodes.push(page);
        }

        if (site.task_id) {
            var task = new TaskTreeNode();
            task.create(site.condition_query, true,
                {title: site.condition_query, usurl_id: site.usurl_id, url_id: site.url_id, task_id: site.task_id, url: site.url,
                    condition_id: site.condition_id, condition_query: site.condition_query, sengine_name: site.sengine_name,
                    region: site.region, size_search: site.size_search},
                'task')
            page.nodes.push(task);
        }

    }
//    console.log("sites ", sites, " tree ", tree);
    return tree;
}

SeoFormat.prototype.getSitePosition = function (allParams, siteParams) {
    if (!allParams && !siteParams){
        return;
    }
    var url = siteParams.url.replace(/^(ftp:\/\/|http:\/\/|https:\/\/)*(www\.)*/g, '')
    if (!url) {
        return null;
    }

    url = url.replace(/\/$/, "").toLowerCase();
    var position = (allParams).filter(function (v) {
        var site = v.url.replace(/^(ftp:\/\/|http:\/\/|https:\/\/)*(www\.)*/g, '')
        if (!site) {
            return false;
        }
//                console.log("PARSE ", site.replace(/\/$/, "").toLowerCase(), url)
        return site.replace(/\/$/, "").toLowerCase() === url;
    })[0]
//            console.log(position, (position ? position.position: null))
    return position ? position.position + 1 : null;
}

//транспорнировать параметры data [{postition,},...]
SeoFormat.prototype.transponateParams = function (data) {
    var res;
    //проверки
    if (!data) {
        throw 'SeoFormat.prototype.transponateParams data cannot be null!';
    }

    //работаем с диаграммой
    var res = []
    //бежим по всем страницам сайтов
    for (var key in data) {
        //получаем позицию сайта
        var position = data[key].position + 1;
        //бежим по всем параметрам страницы
        for (var key1 in data[key].param.params) {
            //получаем параметр страницы
            var current_par = data[key].param.params[key1]
            //если этот параметр страницы был УСПЕШНО посчитан
            if (current_par.success) {
                //получаем значение параметра страницы
                var cur_val = parseFloat(current_par.val);
                //ищем в предварительных результатах нужный нам параметр
                var result = res.filter(function (v) {
                    return v.key === current_par.ru_name;
                })
                //ели нашли (т.е. параметр был уже добавлен)
                if (result.length > 0) {
                    // ищем максимальное значение y
                    if (cur_val > result[0].yrange) {
                        result[0].yrange = cur_val;
                    }
                    //кладем в резуьтат
                    result[0].values.push([position, cur_val])

                } else {
                    //формируем параметр
                    var serial = {
                        key: current_par.ru_name,
                        group: current_par.group,
                        values: [
                            [position, cur_val]
                        ],
                        yrange: cur_val
                    };
                    //кладем в резуьтат
                    res.push(serial)
                }
            }
        }
    }
    return res;
}

SeoFormat.prototype.prettyTable = function (data, site_data) {
    if (!data || data.length == 0 || !site_data) {
        return [];
    }
//            data = data.sort(function (a, b) {
//                return a.position - b.position;
//            })
    var table = []
    for (var key in data) {
        var name = data[key].url.length > 60 ? data[key].url.substr(0, 60) + '...' : data[key].url
        table.push({url: data[key].url, name: name, params: data[key].param.params, surl: data[key].surl,
            position: data[key].position + 1})
    }

    table.push({url: site_data.url, name: 'Ваш сайт', params: site_data.param.params, surl: "-"})
    //console.log("prettyTable", data, table)
//            SeoFormat.prototype.chart1 = table[0]
//            SeoFormat.prototype.values1 = SeoFormat.prototype.chart1.params
    return table;
}


module.exports = SeoFormat;