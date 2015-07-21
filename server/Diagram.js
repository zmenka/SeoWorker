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
    this.diagram = [];
};

Diagram.prototype.getParamsDiagram = function (params, siteParam, corridor) {
    if (!params || params.length == 0) {
        return null;
    }
    var corridor_m = corridor ? parseFloat(corridor.corridor_m) : 0;
    var corridor_d = corridor ? parseFloat(corridor.corridor_d) : 0;
    var site_value = siteParam ? parseFloat(siteParam.param_value) : 0
    var param_name = siteParam ? siteParam.paramtype_ru_name : "";

    var paramsValues = params.map(function (el) {
        return [el.position, parseFloat(el.value)]
    })
    //получаем крайние x-координаты
    var x1 = 0;
    var x2 = params[params.length - 1].position;
    //получаем y нашего сайта
    var ys = parseFloat(site_value);
    //получаем y коридора
    var kD = 1; //кол-во дисперсий в радиусе коридора
    var radius = kD * corridor_d;
    var yk1 = corridor_m - radius;
    var yk2 = corridor_m + radius;
    var yk1 = yk1 > 0 ? yk1 : 0;
    var yk2 = yk2 > 0 ? yk2 : 0;
    x1 = x1.toFixed(2);
    x2 = x2.toFixed(2);
    yk1 = yk1.toFixed(2);
    yk2 = yk2.toFixed(2);
    //увет графика
    var paramsColor = '#1F77B4';
    //получаем цвет уровня нашего сайта

    var siteColor = this.getCoridorRGB(siteParam)
    //строим "коридор"
    this.addFigure('Граница коридора', [[x1, yk2], [x2, yk2], [x2, yk1], [x1, yk1], [x1, yk2]], '#D0FFFF', true);
    //строим уровень нашего сайта
    this.addFigure('Ваш сайт', [[x1, ys], [x2, ys]], siteColor, false);
    //строим график значений параметров выборки
    this.addFigure(param_name, paramsValues, paramsColor, false);

    return this.diagram;
}

Diagram.prototype.getCoridorRGB = function (siteParam) {
    if (!siteParam) {
        return 'rgb(255,255,255)';
    }
    var siteColorR = siteParam.color_r
    var siteColorG = siteParam.color_g
    var siteColorB = 0;
    var siteColor = 'rgb(' + [siteColorR, siteColorG, siteColorB].join(',') + ')';
    //console.log('siteColor')
    //console.log(siteColor)
    return siteColor;

}

Diagram.prototype.addFigure = function (figureKey, figureValues, figureColor, figureArea) {
    //проверки
    if (!figureKey) {
        figureKey = "";
    }
    //по умолчанию
    if (!figureArea) {
        figureArea = false;
    }
    if (!figureColor) {
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
    this.diagram.push(figure)
}



module.exports = Diagram;