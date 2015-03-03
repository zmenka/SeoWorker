var MathStat = require("./MathStat")
var TaskTreeNode = require("./models/TaskTreeNode")

/*
 *
 * Класс для хранения данных для диаграм Diagram.
 *  
 * 
 * Использование:
 * 
 *    //инициализация
 *    var Diagram = require("./server/Diagram");
 *    var diagram = new Diagram();
 *    //добавление фигур
 * 
 */

function Diagram() {
    /*
     *  предполагается такое хранилище:
     * 
     *  diagram [{  
     *                key : object, 
     *                values : [{
     *                              key : string,
     *                              group: string,
     *                              values : [[x1, y1],[x2, y2],...],
     *                              color : string,
     *                              area : boolean
     *                         },...],
     *           }, ... ] 
     */
    this.diagram = null;    
};

Diagram.prototype.getParamsDiagram = function (params,siteParams) {
    try{
        if (!params || params.length == 0 || !siteParams) {
            return null;
        }   
        
        for (var key in params) {
            //получаем данные об отдельном сайте
            var result = siteParams.param.params.filter(function (v) {
                return v.ru_name === params[key].key;
            });
            //если данных по нашему сайту нет, то не выводим график по этому параметру
            if (result.length == 0 || !result[0].success) { 
                continue;
            }
            //получаем данные о "коридоре"
            var mathstat = new MathStat(params[key].values.map(function(element){
                    return element[1];
                }));
            mathstat.calc();
            //получаем крайние x-координаты
            var x1 = 0;
            var x2 = params[key].values[params[key].values.length - 1][0];
            //получаем y нашего сайта
            var ys = parseFloat(result[0].val);
            //получаем y коридора
            var kD = 0.5; //кол-во дисперсий в радиусе коридора
            var radius = kD * mathstat.D;
            var yk1 = mathstat.M - radius;
            var yk2 = mathstat.M + radius;
            yk1 = yk1.toFixed(2);
            yk2 = yk2.toFixed(2);
            //увет графика
            params[key].color = '#1F77B4';
            //получаем цвет уровня нашего сайта
            var kColor = 0.25; //скорость "покраснения"
            var delta = Math.abs(ys - mathstat.M);
            var siteColorR = parseInt(delta < radius ? (255 * delta/radius) : 255,10);
            var siteColorG = parseInt(delta < radius ? 255 : (Math.max(255 *(1 - kColor * (delta-radius)/radius),0)),10);
            var siteColorB = 0;
            var siteColor = 'rgb(' + [siteColorR,siteColorG,siteColorB].join(',') + ')';
            result[0].siteColor = siteColor;
            //строим "коридор"
            this.addFigureByParams(params[key].key,'Граница коридора',[[x1, yk2], [x2, yk2],[x2, yk1],[x1, yk1],[x1, yk2]],'#D0FFFF',true,params[key].group);
            //строим уровень нашего сайта
            this.addFigureByParams(params[key].key,'Ваш сайт',[[x1, ys],[x2, ys]],siteColor,false,params[key].group);
            //строим график значений параметров выборки
            this.addFigure(params[key].key,params[key],params[key].group);
        }
        return this.diagram;
    } catch(er){
        console.log(er);
        return;
    }
}

Diagram.prototype.getTreeParamsDiagram = function (params) {
    if (!params || params.length == 0 ) {
        return null;
    }
    var tree = [];
    for (var key in params) {
        console.log(params[key].group, params[key].key);
        var groups = tree.filter(function (v) {
            return v.title === params[key].group;
        });

        var node;
        if (groups.length > 0) {
            node = groups[0];
        } else {
            node = new TaskTreeNode();
            node.create(params[key].group, true,
                {}, 'group');
            tree.push(node)
        }
        var keyPar = new TaskTreeNode();
        keyPar.create(params[key].key, true, params[key], 'key');
        node.nodes.push(keyPar);
    }
    return tree;

}
 
Diagram.prototype.addFigure = function (diagramKey,figure, groupName) {
    //проверки
    if(!figure){ throw 'Diagram.prototype.addFigure figure cannot be null!'; }
    if(!diagramKey){ throw 'Diagram.prototype.addFigure diagramKey cannot be null!'; } 
    if(!this.diagram){ this.diagram = []; }
    //ищем нужную диаграмму
    var result = this.diagram.filter(function (v) {
        return v.key === diagramKey;
    })
    //добавляем фигуру в этот диаграмму
    if (result.length > 0) {
        result[0].values.push(figure)
    } 
    //если нет еще диаграммы с таким ключом
    else {
        this.diagram.push({key: diagramKey, values: [figure], group: groupName})
    }
}
Diagram.prototype.addFigureByParams = function (diagramKey,figureKey,figureValues,figureColor,figureArea,groupName) {
    //проверки
    if(!diagramKey){throw 'Diagram.prototype.addFigureByParams diagramKey cannot be null!';}
    if(!figureKey){throw 'Diagram.prototype.addFigureByParams diagramKey cannot be null!';}
    //по умолчанию
    if(!figureArea){
          figureArea = false;
    }
    if(!figureColor){
          figureColor = 'blue';
    }
    //инициализируем фигуру
    var figure = {
                    key: figureKey,
                    values: figureValues,
                    color: figureColor,
                    area: figureArea
                 };
    //добавляем фигуру
    this.addFigure(diagramKey,figure, groupName);
}

module.exports = Diagram;