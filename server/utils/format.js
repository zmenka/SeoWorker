
module.exports = function () {
    var args = [].splice.call(arguments,1);
    var query = arguments[0];

    return query.replace(/{(\d+)}/g, function (match, number) {
        var result = args[number];
        if (typeof result == 'string'){
            result = result.replace(/\\/g,"\\\\");
            result = result.replace(/'/g,"\\'");
        } else if (typeof result == 'number'){
            return result;
        }
        if (typeof result != 'undefined' && result != null){
            result = "'" + result + "'";
        } else {
            result = 'NULL';
        }
        return result;
    });
};