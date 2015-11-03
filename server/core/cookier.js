var PgManager = require("./../db/models/pg_manager");
var PgUsers = require("./../db/models/pg_users");


var Cookier = {};

Cookier.update = function () {
    return PgManager.getCookieTaskUpdateTime()
        .then(function (date_update) {
            return Cookier.updateByDate(date_update);
        })

};
Cookier.updateByDate = function (date) {
    //если куки удалялись больше чем 3 часа - чистим
    if (date && (Math.abs(new Date() - date) / 36e5) > 2) {
        console.log('Cookier.clean clean cookie!');
        return PgUsers.deleteCookies()
            .then(function () {
                PgManager.updateCookieTaskUpdateTime(new Date())
            })
    }
};
module.exports = Cookier;