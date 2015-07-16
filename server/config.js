/**
 * Created by zmenka on 01.11.14.
 */

var Config = (function () {
    function Config() {
    }
    Config.postgres = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/seo';
    Config.passport_key = process.env.PASSPORT_KEY || '';
    Config.antigate_key = process.env.ANTIGATE_KEY || '';
    return Config;
})();

module.exports = Config;