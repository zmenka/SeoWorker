/**
 * Created by zmenka on 01.11.14.
 */

var Config = (function () {
    function Config() {
    }
    Config.postgres = process.env.DATABASE_URL || 'postgres://postgres@localhost:5433/seo';
    Config.passport_key = process.env.PASSPORT_KEY || 'JHYY79YGI89GKGKG9';
    Config.antigate_key = process.env.ANTIGATE_KEY || '';
    Config.private_ip = process.env.PRIVATE_IP || '127.0.0.1';
    Config.port = process.env.PORT || 3000;
    return Config;
})();

module.exports = Config;
