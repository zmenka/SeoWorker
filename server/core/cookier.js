var PgManager = require("./../db/models/pg_manager");
var PgUsers = require("./../db/models/pg_users");


var Cookier = {};

Cookier.update = function () {
    return PgManager.getCookieTaskUpdateTime()
        .then(function (date) {
            return Cookier.updateByDate(date);
        })
        .catch(function (err) {
            console.log('Cookier.update  err: ', err, err.stack);
        })
};
Cookier.updateByDate = function (date) {
    //если куки удалялись больше чем 3 часа - чистим
    if (date && (Math.abs(new Date() - date) / 36e5) > 3) {
        console.log('Cookier.clean clean cookie!');
        return PgUsers.deleteCookies()
            .then(function () {
                PgManager.updateCookieTaskUpdateTime(new Date())
            })
    }
};
module.exports = Cookier;