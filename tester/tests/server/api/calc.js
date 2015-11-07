var api = require('../../../utils/api');
var Export = {};

Export.updateCondition = api.test_api(
    'post',
    '/api/calc_params', {
        url: 'http://www.velokat.su/arenda/o_nas',
        condition_id: 1508
    }
);

module.exports = Export;