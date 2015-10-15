var Access = require("./access");

var ApiUtils = {}

ApiUtils.callback = function (data, response) {
    response.json(data);
};

ApiUtils.errback = function (err, response, userMsg) {
    var msg = (err && err.stack) ? err.stack : (err ? err : userMsg)
    console.log(msg);
    response.statusCode = 440;
    var userMsgResult = userMsg ? userMsg : (err && !err.message ? err : '');
    response.send(userMsgResult);
};

ApiUtils.simple_api_func = function (req, res, funcPromise, paramsArray, checkAuth, checkAdmin) {

    if (checkAuth && !Access.isAuth(req)) {
        ApiUtils.errback(null, res, "Вы не зарегистрировались.");
        return;
    }

    if (checkAdmin && !Access.isAdmin(req)) {
        ApiUtils.errback(null, res, "Вы не админ.");
        return;
    }
    console.log(req.url, paramsArray);
    return funcPromise.apply(null, paramsArray)
        .then(function (result) {
            ApiUtils.callback(result, res);
        })
        .catch(function (err) {
            ApiUtils.errback(err, res);
        })
};

ApiUtils.auth_api_func = function (req, res, funcPromise, paramsArray) {
    return ApiUtils.simple_api_func (req, res, funcPromise, paramsArray, true)
}

ApiUtils.admin_api_func = function (req, res, funcPromise, paramsArray) {
    return ApiUtils.simple_api_func (req, res, funcPromise, paramsArray, true, true)
}

module.exports = ApiUtils