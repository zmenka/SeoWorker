
var superagent = require('superagent');
var app = require('../../server')
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

describe('API TEST', function () {

    var loginAgent;
    before(function (done) {
        login(request, function (authAgent) {
            loginAgent = authAgent;
            done();
        });
    });

    var test_api = function (mode, api, params) {
        //it.only(api, function (done) {
        it(api, function (done) {
            var req;
            if (mode == 'post') {
                console.log('post', params)
                req = request.post(api);
                agent.attachCookies(req);
                req.send(params).expect(200)
                    .end(function(err, res){
                        console.log("res.body")
                        console.log(res.body)
                        console.log("err")
                        console.log(err)
                        done(err)
                    });
            }
            else {
                console.log('get', api)
                req = request.get(api);
                agent.attachCookies(req);
                req.expect(200)
                    .end(function(err, res){
                        console.log("res.body")
                        console.log(res.body)
                        console.log("err")
                        console.log(err)
                        done(err)
                    });
            }
        });
    }
    /*
     test_api('post','/api/detail/edit', {id: 5, date: '2015-09-03', detailtype_id: 2, machine_id: 2, done: 0});
     test_api('get' ,'/api/details?from=2014-01-01&to=2016-01-01');
     */
//test_api('get' ,'/api/detail/print?id=1');
    //test_api('get' ,'/api/users?user_id=84&role_id=1');
    //test_api('get' ,'/api/user_sites_and_tasks?user_id=106&with_disabled=true');
    //test_api('get' ,'/api/user_sites_and_tasks?user_id=84&with_disabled=false');
    //test_api('post','/api/get_paramtypes', { condition_id: 1508, url_id: 166660 });
    test_api('post','/api/calc_params', { url: 'http://www.velokat.su/arenda/o_nas', condition_id: 1508 });
});