var api = require('../../../utils/api');
var Export = {};

Export.getUsers = api.test_api(
    'get',
    '/api/users'
);

module.exports = Export;