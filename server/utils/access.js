var PgUsers = require("../db/models/pg_users");
var Q = require("q")
var Access = function (){

}

Access.prototype.isUserAvailableToUser = function (user_id, to_user_id, role_id){
    return Q.fcall(function () {
        if (user_id == to_user_id || role_id == 1){
            return true
        } else{
            return new PgUsers().isUserAvailableToUser(user_id, to_user_id)
        }
    });
}
module.exports = Access