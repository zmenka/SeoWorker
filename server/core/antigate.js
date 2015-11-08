var rp = require('request-promise');
var Promise = require('../utils/promise');
var Logger = require('../utils/logger');
var Antigate = {}

Antigate.getByUrl = function (url, key) {
    if (!key){
        return Promise.reject(new Error('no antigate key'))
    }
    return Antigate.loadByUrl(url)
        .then(function (data) {
            return Antigate.upload(data, key)
        })
        .then(function (id) {
            return Antigate.check(id, key)
        })
}

Antigate.loadByUrl = function (url) {
    var options = {
        encoding: null,
        uri: url
    };

    return rp(options)
        .then(function (img) {
            return img.toString('base64')
        })
        .catch(function (err) {
            throw err
        })
}

Antigate.upload = function (body, key) {
    var options = {
        method: 'POST',
        uri: 'http://antigate.com/in.php',
        form: {
            method: 'base64',
            key: key,
            body: body,
            is_russian: 1
        }
    };
    return rp(options)
        .then(function (body) {
            if (body.indexOf('OK') === 0) {
                return body.split('|')[1];
            } else {
                throw new Error('not correct upload body ' + body)
            }
        })
        .catch(function (err) {
            throw err
        })
}

Antigate.check = function (id, key, delayTimes) {
    var url = 'http://antigate.com/res.php?key='
        + key
        + '&action=get&id='
        + id;
    delayTimes = delayTimes || 0
    return rp(url)
        .then(function (body) {
            if (body.indexOf('OK') === 0) {
                Logger.INFO('ANTIGATE DONE', body)
                return body.split('|')[1];
            } else if (body === 'CAPCHA_NOT_READY') {
                return Promise.delay(500)
                    .then(function() {
                        return Antigate.check(id, key, delayTimes + 500)
                    })
            } else {
                throw new Error('unknown response from antigate ' + body);
            }
        })
        .catch(function (err) {
            throw err
        })

};

module.exports = Antigate.getByUrl;