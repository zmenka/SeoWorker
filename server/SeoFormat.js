var TaskTreeNode = require("./models/TaskTreeNode.js");

var SeoFormat = {};

SeoFormat.createSiteTree = function (sites) {
    if (!sites || sites.length == 0) {
        return [];
    }
    var tree = [];

    for (var i = 0; i < sites.length; i++) {
        var site = sites[i];
        //console.log("site", site);
        var domen = site.domen;
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
                {
                    title: site.url,
                    usurl_id: site.usurl_id,
                    url_id: site.url_id,
                    removable: false,
                    percent: null,
                    color_r: 0,
                    color_g: 0,
                    color_b: 0
                }, 'domen');
            tree.push(domenNode)
        }
        if (domenNode.data.percent) {
            if (site.percent)
                domenNode.data.percent += site.percent;
        }
        else if (site.percent || site.percent == 0) {
            domenNode.data.percent = site.percent;
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
                {
                    title: site.url,
                    usurl_id: site.usurl_id,
                    url_id: site.url_id,
                    url: site.url,
                    usurl_disabled: site.usurl_disabled,
                    removable: !site.usurl_disabled,
                    percent: null,
                    color_r: 0,
                    color_g: 0,
                    color_b: 0
                }, 'page');
            domenNode.nodes.push(page);
        }

        if (page.data.percent) {
            if (site.percent)
                page.data.percent += site.percent;
        }
        else if (site.percent || site.percent == 0) {
            page.data.percent = site.percent;
        }

        if (site.task_id) {
            var task = new TaskTreeNode();
            task.create(site.condition_query + " (" + site.sengine_name + ", " + site.size_search + (site.region_name ? ", " + site.region_name : "") + ")",
                true,
                {
                    title: site.condition_query,
                    usurl_id: site.usurl_id,
                    url_id: site.url_id,
                    task_id: site.task_id,
                    disabled: site.task_disabled || site.usurl_disabled,
                    removable: !site.task_disabled,
                    date_calc: site.date_calc,
                    url: site.url,
                    condition_id: site.condition_id,
                    condition_query: site.condition_query,
                    sengine_name: site.sengine_name,
                    sengine_id: site.sengine_id,
                    region_id: site.region_id,
                    region_name: site.region_name,
                    size_search: site.size_search,
                    percent: site.percent,
                    color_r: site.color_r,
                    color_g: site.color_g,
                    color_b: site.color_b
                },
                'task')
            page.nodes.push(task);
        }

    }

    for (var i = 0; i < tree.length; i++) {
        var domen = tree[i];
        cnt = 0;

        for (var j = 0; j < domen.nodes.length; j++) {
            var page = domen.nodes[j];
            page.data.disabled = page.nodes.filter((function (el) {
                    return el.data.disabled
                })).length == page.nodes.length && page.nodes.length > 0

            if (page.data.percent) {
                var colorNodesCnt = page.nodes.filter((function (el) {
                    return el.data.percent || el.data.percent == 0
                })).length
                page.data.percent = page.data.percent / colorNodesCnt
                cnt += colorNodesCnt
            }
            page.data.color_r = this.getColorByPercent(page.data.percent, 'R')
            page.data.color_g = this.getColorByPercent(page.data.percent, 'G')
            page.data.color_b = this.getColorByPercent(page.data.percent, 'B')

            //console.log(page.title, page.data.percent, page.data.color_r,page.data.color_g,page.data.color_b)
        }

        domen.data.disabled = domen.nodes.filter((function (el) {
                return el.data.disabled
            })).length == domen.nodes.length && domen.nodes.length > 0

        if (domen.data.percent) {
            domen.data.percent = domen.data.percent / cnt
        }
        domen.data.color_r = this.getColorByPercent(domen.data.percent, 'R')
        domen.data.color_g = this.getColorByPercent(domen.data.percent, 'G')
        domen.data.color_b = this.getColorByPercent(domen.data.percent, 'B')
    }
//    console.log("sites ", sites, " tree ", tree);
    return tree;
}

//SeoFormat.getSitePosition = function (allParams, siteParams) {
//    if (!allParams || !siteParams) {
//        return;
//    }
//    var url = siteParams.url.replace(/^(ftp:\/\/|http:\/\/|https:\/\/)*(www\.)*/g, '')
//    if (!url) {
//        return null;
//    }
//
//    url = url.replace(/\/$/, "").toLowerCase();
//    var position = (allParams).filter(function (v) {
//        var site = v.url.replace(/^(ftp:\/\/|http:\/\/|https:\/\/)*(www\.)*/g, '')
//        if (!site) {
//            return false;
//        }
////                console.log("PARSE ", site.replace(/\/$/, "").toLowerCase(), url)
//        return site.replace(/\/$/, "").toLowerCase() === url;
//    })[0]
////            console.log(position, (position ? position.position: null))
//    return position ? position.position + 1 : null;
//}
//
////транспорнировать параметры data [{postition,},...]
//SeoFormat.transponateParams = function (data) {
//    var res;
//    //проверки
//    if (!data) {
//        throw 'SeoFormat.prototype.transponateParams data cannot be null!';
//    }
//
//    var res = []
//    //бежим по всем страницам сайтов
//    for (var key in data) {
//        //получаем позицию сайта
//        var position = data[key].position + 1;
//        //бежим по всем параметрам страницы
//        for (var key1 in data[key].param.params) {
//            //получаем параметр страницы
//            var current_par = data[key].param.params[key1]
//            //если этот параметр страницы был УСПЕШНО посчитан
//            if (current_par.success) {
//                //получаем значение параметра страницы
//                var cur_val = parseFloat(current_par.val);
//                //ищем в предварительных результатах нужный нам параметр
//                var result = res.filter(function (v) {
//                    return v.key === current_par.ru_name;
//                })
//                //ели нашли (т.е. параметр был уже добавлен)
//                if (result.length > 0) {
//                    // ищем максимальное значение y
//                    if (cur_val > result[0].yrange) {
//                        result[0].yrange = cur_val;
//                    }
//                    //кладем в резуьтат
//                    result[0].values.push([position, cur_val])
//
//                } else {
//                    //формируем параметр
//                    var serial = {
//                        key: current_par.ru_name,
//                        group: current_par.group,
//                        values: [
//                            [position, cur_val]
//                        ],
//                        yrange: cur_val
//                    };
//                    //кладем в резуьтат
//                    res.push(serial)
//                }
//            }
//        }
//    }
//    return res;
//}
//
//SeoFormat.prettyTable = function (data, site_data) {
//    if (!data || data.length == 0 || !site_data) {
//        return [];
//    }
////            data = data.sort(function (a, b) {
////                return a.position - b.position;
////            })
//    var table = []
//    for (var key in data) {
//        table.push({
//            url: data[key].url, name: data[key].url, params: data[key].param.params, surl: data[key].surl,
//            position: data[key].position + 1
//        })
//    }
//
//    table.push({url: site_data.url, name: 'Ваш сайт', params: site_data.param.params, surl: "-"})
//    //console.log("prettyTable", data, table)
////            SeoFormat.prototype.chart1 = table[0]
////            SeoFormat.prototype.values1 = SeoFormat.prototype.chart1.params
//    return table;
//}
//
//SeoFormat.getTreeFromParamtypes = function (paramtypes) {
//
//    if (!paramtypes || paramtypes.length == 0) {
//        return null;
//    }
//    var tree = [];
//    for (var key in paramtypes) {
//        //console.log(paramtypes[key].paramtype_tag, paramtypes[key]);
//        var groups = tree.filter(function (v) {
//            return v.title === paramtypes[key].paramtype_tag;
//        });
//
//        var node;
//        if (groups.length > 0) {
//            node = groups[0];
//        } else {
//            node = new TaskTreeNode();
//            node.create(paramtypes[key].paramtype_tag, true,
//                {
//                    percent: null,
//                    color_r: 0,
//                    color_g: 0,
//                    color_b: 0
//                }, 'group');
//            tree.push(node)
//        }
//        if (node.data.percent) {
//            if (paramtypes[key].percent)
//                node.data.percent += paramtypes[key].percent;
//        }
//        else if (paramtypes[key].percent || paramtypes[key].percent == 0) {
//            node.data.percent = paramtypes[key].percent;
//        }
//
//        var keyPar = new TaskTreeNode();
//        keyPar.create(paramtypes[key].paramtype_ru_name, true, paramtypes[key], 'key');
//        node.nodes.push(keyPar);
////        console.log('keyPar',keyPar);
//    }
//
//    for (var i = 0; i < tree.length; i++) {
//        var group = tree[i];
//        if (group.data.percent) {
//            var colorNodesCnt = group.nodes.filter((function (el) {
//                return el.data.percent || el.data.percent == 0
//            })).length
//            group.data.percent = group.data.percent / colorNodesCnt
//        }
//        group.data.color_r = this.getColorByPercent(group.data.percent, 'R')
//        group.data.color_g = this.getColorByPercent(group.data.percent, 'G')
//        group.data.color_b = this.getColorByPercent(group.data.percent, 'B')
//
//        //console.log(group.title, group.data.percent,group.data.color_r,group.data.color_g,group.data.color_b)
//    }
//    return tree;
//
//}
//
//SeoFormat.getColorByPercent = function (percent, color) {
//    //console.log(percent,color)
//    if (!percent && percent != 0)
//        return 255;
//    if (color == 'R' && percent > 50)
//        return parseInt((100 - percent) * 255 / 50)
//    else if (color == 'G' && percent < 50)
//        return parseInt(percent * 255 / 50)
//    else if (color == 'B')
//        return 0
//    else
//        return 255
//
//
//}
//

module.exports = SeoFormat;