var PgUsers = require("../db/models/pg_users");
var Promise = require("./promise")
var Access = {}

Access.isUserAvailableToUser = function (user_id, to_user_id, to_role_id){
    return Promise.try(function () {
        if (user_id == to_user_id || to_role_id == 1){
            return true
        } else{
            return PgUsers.isUserAvailableToUser(user_id, to_user_id)
        }
    });
}

Access.isAuth = function (req) {
    return req.user && req.user.user_id
};

Access.isAdmin = function (req) {
    return Access.isAuth && req.user.role_id == 1
};

module.exports = Access