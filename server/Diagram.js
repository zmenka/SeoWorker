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

Diagram.prototype.getParamsDiagram = function (params, siteParam) {
    if (!params || params.length == 0 || !siteParam) {
            return null;
        }
            var paramsValues = params.map(function(el){
                return [el.position, parseFloat(el.value)]
            })
            //получаем данные о "коридоре"
            var mathstat = new MathStat(params.map(function(el){
                return parseFloat(el.value)
            }));
            mathstat.calc();
            //получаем крайние x-координаты
            var x1 = 0;
            var x2 = params[params.length - 1].position;
            //получаем y нашего сайта
            var ys = parseFloat(siteParam.param_value);
            //получаем y коридора
            var kD = 0.5; //кол-во дисперсий в радиусе коридора
            var radius = kD * mathstat.D;
            var yk1 = (mathstat.M - radius) > 0 ? (mathstat.M - radius) : 0;
            var yk2 = (mathstat.M + radius) > 0 ? (mathstat.M + radius) : 0;
            yk1 = yk1.toFixed(2);
            yk2 = yk2.toFixed(2);
            //увет графика
            var paramsColor = '#1F77B4';
            //получаем цвет уровня нашего сайта
            var kColor = 0.25; //скорость "покраснения"
            var delta = Math.abs(ys - mathstat.M);
            var siteColorR = parseInt(delta < radius ? (255 * delta/radius) : 255,10);
            var siteColorG = parseInt(delta < radius ? 255 : (Math.max(255 *(1 - kColor * (delta-radius)/radius),0)),10);
            var siteColorB = 0;
            var siteColor = 'rgb(' + [siteColorR,siteColorG,siteColorB].join(',') + ')';

            //строим "коридор"
            this.addFigure('Граница коридора',[[x1, yk2], [x2, yk2],[x2, yk1],[x1, yk1],[x1, yk2]],'#D0FFFF',true);
            //строим уровень нашего сайта
            this.addFigure('Ваш сайт',[[x1, ys],[x2, ys]],siteColor,false);
            //строим график значений параметров выборки
            this.addFigure(siteParam.paramtype_ru_name,paramsValues, paramsColor, false);

        return this.diagram;
}

Diagram.prototype.addFigure = function (figureKey,figureValues,figureColor,figureArea) {
    //проверки
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
    this.diagram.push(figure)
}

module.exports = Diagram;