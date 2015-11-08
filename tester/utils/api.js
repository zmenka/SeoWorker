var superagent = require('superagent');
var app = require('../../server');
var request = require('supertest')(app);
var agent = superagent.agent();

var testAccount = {
    "login": "superadmin",
    "password": "SeoTest36475"
};

var login = function (request, done) {
    request
        .post('/api/login')
        .send(testAccount)
        .end(function (err, res) {
            if (err) {
                throw err;
            }
            agent.saveCookies(res);
            done(agent);
        });
};


var test_api = function (mode, api, params) {
    return function (done) {
        var req;
        if (mode == 'post') {
            req = request.post(api);
            agent.attachCookies(req);
            req.send(params).expect(200)
                .end(function (err, res) {
                    done(err)
                });
        }
        else {
            req = request.get(api);
            agent.attachCookies(req);
            req.expect(200)
                .end(function (err, res) {
                    done(err)
                });
        }
    };
};

function before(done) {
    login(request, function (authAgent) {
        loginAgent = authAgent;
        done();
    });
}

var api = {
    test_api: test_api,
    before: before
};

module.exports = api;