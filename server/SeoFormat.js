var MathStat = require("./MathStat")

function SeoFormat() {
    //console.log('SeoFormat init');
};



SeoFormat.prototype.createSiteTree = function (sites) {
    if (!sites || sites.length == 0) {
        return [];
    }
    var tree = [];
    for (var i = 0; i < sites.length; i++) {
        var f = function (site) {
            //console.log("site", site);
            //var domen = sites[i].url.match(/(?:http:\/\/|https:\/\/|)(?:www.|)([^\/]+)\/?(.*)/)[1];
            //console.log("dom
            // en", domen);

            var result = tree.filter(function (v) {
                return v.title === site.url;
            })
            //console.log("match", result);
            if (!site.task_id) {
                var s = null
            } else {
                var s = {title: site.condition_query, nodes: [], usurl_id: site.usurl_id, url_id: site.url_id, task_id: site.task_id, url: site.url,
                    condition_id: site.condition_id, condition_query: site.condition_query, sengine_name: site.sengine_name,
                    region: site.region, size_search: site.size_search};
            }
            var row
            if (result.length > 0) {
                row = result[0];
            } else {
                row = {title: site.url, usurl_id: site.usurl_id, url_id: site.url_id, nodes: []}
                tree.push(row)
            }
            if (s) {
                row.nodes.push(s)
            }
        };
        f(sites[i]);
    }
    console.log("sites ", sites, " tree ", tree);
    return tree;
};
        
SeoFormat.prototype.getSitePosition = function (allParams, siteParams) {
    var url = siteParams.url.replace(/^(ftp:\/\/|http:\/\/|https:\/\/)*(www\.)*/g,'')
    if (!url){
        return null;
    }

    url =url.replace(/\/$/, "").toLowerCase();
    var position = (allParams).filter(function (v) {
        var site = v.url.replace(/^(ftp:\/\/|http:\/\/|https:\/\/)*(www\.)*/g,'')
        if (!site){
            return false;
        }
//                console.log("PARSE ", site.replace(/\/$/, "").toLowerCase(), url)
        return site.replace(/\/$/, "").toLowerCase() === url;
    })[0]
//            console.log(position, (position ? position.position: null))
    return position ? position.position+1: null;
}

SeoFormat.prototype.prettyDiagram = function (data, site_data, stat_data) {
    if (!data || data.length == 0 || !site_data) {
        return [];
    }   
    
    //работаем с диаграммой
    var diagram = []
    for (var key in data) {
        var position = data[key].position + 1;
        for (var key1 in data[key].param.params) {
            var current_par = data[key].param.params[key1]
            if (current_par.success) {
                var cur_val = parseFloat(current_par.val)
                var result = diagram.filter(function (v) {
                    return v.key === current_par.ru_name;
                })
                var serial = {key: current_par.ru_name, values: [
                    [position, cur_val]
                ], yrange: 0}
                if (result.length > 0) {
                    if (cur_val > result[0].yrange) {
                        result[0].yrange = cur_val;
                    }
                    result[0].values.push([position, cur_val])

                } else {
                    diagram.push(serial)
                }
            }

        }
    }
    var diagramExt = [];
    for (var key in diagram) {
        var result = site_data.param.params.filter(function (v) {
            return v.ru_name === diagram[key].key;
        })
        //получаем данные о "коридоре"
        try{
            var mathstat = new MathStat(diagram[key].values.map(function(element){
                    return element[1];
                }));
            mathstat.calc();
            //console.log(mathstat.array);
        } catch(er){
            console.log(er);
        }
        console.log(diagram[key].key);
        console.log(mathstat.array);
        console.log(mathstat.M);
        console.log(mathstat.D);
        var x1 = 0;
        var x2 = diagram[key].values[diagram[key].values.length - 1][0];
        var ys = parseFloat(result[0].val);
        var kD = 0.5;
        var yk1 = mathstat.M - kD * mathstat.D;
        var yk2 = mathstat.M + kD * mathstat.D;
        yk1 = yk1.toFixed(2);
        yk2 = yk2.toFixed(2);
        //строим уровень нашего сайта
        if (result.length > 0 && result[0].success) {
            diagramExt.push({key: diagram[key].key,
                values: [
                    diagram[key],
                    {
                        key: 'Граница коридора',
                        values: [[x1, yk2], [x2, yk2],[x2, yk1],[x1, yk1],[x1, yk2]],
                        color: 'orange',
                        area: true
                    },
                    {
                        key: 'Ваш сайт',
                        values: [[x1, ys],[x2, ys]],
                        color: 'red'
                    },
                    {
                        key: 'Среднее',
                        values: [[x1, mathstat.M],[x2, mathstat.M]],
                        color: 'green'
                    }
                ]
            })
        }
    }

    //console.log("prettyDiagram", diagramExt, diagram)
//            SeoFormat.prototype.chart = null
//            SeoFormat.prototype.values = SeoFormat.prototype.chart.values;
    return diagramExt;
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
            position: data[key].position+1})
    }

    table.push({url: site_data.url, name: 'Ваш сайт', params: site_data.param.params, surl: "-"})
    //console.log("prettyTable", data, table)
//            SeoFormat.prototype.chart1 = table[0]
//            SeoFormat.prototype.values1 = SeoFormat.prototype.chart1.params
    return table;
}


module.exports = SeoFormat;