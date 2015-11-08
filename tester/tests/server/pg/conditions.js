var PgModel = require("../../../../server/db/models/pg_conditions");
var Logger = require("../../../../server/utils/logger");
var Export = {};

Export.getNext = function () {
    return PgModel.getNext()
        .then(function (res) {
            Logger.DEBUG(res);
            return res
        });

};

module.exports = Export;