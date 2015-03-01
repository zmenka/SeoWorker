/*
 *
 * Математический класс MathStat.
 * Подсчет характеристик выборки для анализа
 *  
 * 
 * Использование:
 * 
 *    var MathStat = require("./server/MathStat");
 *    //передача массива при инициализации
 *    var mathstat = new MathStat([ 41, 28, 20, 24, 30, 31, 21, 11, 17, 26, 16 ]);
 *    //запуск подсчета
 *    mathstat.calc();
 *    //"матожидание"
 *    console.log('M = ' + mathstat.M);
 *    //"дисперсия"
 *    console.log('D = ' + mathstat.D);
 * 
 */
function MathStat(array) {
    //console.log('MathStat init');
    this.array = array;
    this.D = null;
    this.M = null;
};

MathStat.prototype.calc = function () {
    //var date = new Date();
    //обработка ошибок
    if(this.array == null || this.array.length == 0){
        throw new Error('MathStat. Пустой массив данных');
    } 
    //степень "сжатия"
    var powM = 0.25;
    var powD = 0.5;
    //инициализируем количетво эелементов
    var count = 0;
    //считаем сумму массива
    var sum = this.array.reduce(function(pv, cv) { count++; return pv + Math.pow(cv, powM); }, 0);
    //получаем математичекое ожидание
    this.M = Math.pow(sum/count, 1/powM);
    var M = this.M;
    //получаем суммарное квадратичное отклонение
    sum = this.array.reduce(function(pv, cv) { return pv + Math.pow(Math.abs(M - cv),powD); }, 0);
    //получаем "несмещенную" диспресию
    if(count == 1){
        //если единственный элемент массива то диспресия нулевая
        this.D = 0;
    } else{
        //иначе считаем
        this.D = Math.pow(sum/(count - 1),1/powD);
    }
    //console.log(- date.getTime() + (new Date()).getTime());
}

module.exports = MathStat;