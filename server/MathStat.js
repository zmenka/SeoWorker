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
    this.D = null;
    this.M = null;
    this.array = array.filter(function(number) { return number > 0; });
};

MathStat.prototype.calc = function () {
    //var date = new Date();
    //обработка ошибок
    if(this.array == null){
        throw new Error('MathStat. Пустой массив данных');
    }
    if(this.array.length == 0){
        this.D = 0;
        this.M = 0;
        return
    }
    //степень "сжатия"
    var powM = 0.25;
    var powD = 0.5;
    //инициализируем количество элементов
    var count = 0;
    //считаем сумму массива
    var sum = this.array.reduce(function(pv, cv) { count++; return pv + Math.pow(cv, powM); }, 0);
    //получаем математическое ожидание
    this.M = Math.pow(sum/count, 1/powM);
    var M = this.M;
    //получаем суммарное квадратичное отклонение
    sum = this.array.reduce(function(pv, cv) { return pv + Math.pow(Math.abs(M - cv),powD); }, 0);
    //получаем "несмещенную" дисперсию
    if(count == 1){
        //если единственный элемент массива то дисперсия нулевая
        this.D = 0;
    } else{
        //иначе считаем
        this.D = Math.pow(sum/(count - 1),1/powD);
    }
    if (this.D > this.M)
    	this.D = this.M
    //console.log(- date.getTime() + (new Date()).getTime());
}

module.exports = MathStat;