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
     *                              key : object, 
     *                              values : [[x1, y1],[x2, y2],...],
     *                              color : string,
     *                              area : boolean
     *                         },...]
     *           }, ... ] 
     */
    this.diagram = [];    
};

Diagram.prototype.addFigure = function (diagramKey,figure) {
    //проверки
    if(!figure){ throw 'Diagram.prototype.addFigure figure cannot be null!'; }
    if(!diagramKey){ throw 'Diagram.prototype.addFigure diagramKey cannot be null!'; } 
    //ищем нужную диаграмму
    var result = diagram.filter(function (v) {
        return v.key === diagramKey;
    })
    //добавляем фигуру в этот диаграмму
    if (result.length > 0) {
        result[0].values.push(figure)
    } 
    //если нет еще диаграммы с таким ключом
    else {
        diagram.push({key: diagramKey, values: [figure]})
    }
}
Diagram.prototype.addFigureByParams = function (diagramKey,figureKey,figureValues,figureColor,figureArea) {
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
    this.addFigure(diagramKey,figure);
}

module.exports = Diagram;