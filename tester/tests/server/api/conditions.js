var api = require('../../../utils/api');
var Export = {};

Export.reset = api.test_api(
    'post',
    '/api/conditions/reset'
);

module.exports = Export;