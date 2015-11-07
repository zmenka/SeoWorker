var PgModel = require("../../../../server/db/models/pg_conditions");
var Export = {};

Export.getNext = function () {
    return PgModel.getNext()
        .then(function (res) {
            console.log(res);
            return res
        });

};

module.exports = Export;