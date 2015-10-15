var PgUsurls = require("../db/models/old/pg_usurls");
var Access = require("../utils/access");
var SeoFormat = require("../SeoFormat");

var Users = {}

Users.userSitesAndTasks = function (user_id, to_user_id, to_role_id, with_disabled){
    with_disabled = with_disabled == 'true' ? true : false;

    return Access.isUserAvailableToUser(user_id, to_user_id, to_role_id)
        .then(function (isAvailable) {
            if (!isAvailable) {
                throw new Error("Нет доступа")
                return
            }
            return PgUsurls.listWithTasks(user_id, with_disabled)
                .then(function (dirty_sites) {
                    return SeoFormat.createSiteTree(dirty_sites);
                })
        })
}
module.exports = Users