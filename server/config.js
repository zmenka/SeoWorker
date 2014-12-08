/**
 * Created by zmenka on 01.11.14.
 */

var Config = (function () {5
    function Config() {
    }
    Config.postgres = process.env.DATABASE_URL || 'postgres://postgres@localhost:5433/seo';
    return Config;
})();

module.exports = Config;