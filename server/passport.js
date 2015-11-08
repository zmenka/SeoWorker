
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var PgUsers = require('./db/models/pg_users');
var PgGroups = require('./db/models/pg_groups');

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user_id, done) {
        //console.log('serializeUser', user_id)
        done(null, user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (user_id, done) {
        //console.log('deserializeUser', user_id)
        var user;
        return PgUsers.get(user_id)
            .then(function (user_res) {
                user = user_res
                return PgGroups.listAdminGroups(user_id, user.role_id)
            })
            .then(function (groups) {
                user.groups = groups
                done(null, user);
            })
            .catch(function (err) {
                done(err);
            })
    });

    passport.use('login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'login',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            //console.log("passport login ", username, password)
            // check in db if a user with username exists or not
            PgUsers.getByLogin(username)
                .catch(function (err) {
                    throw new Error('Пользователя с таким логином нет.')
                })
                .then(function (user) {
                    // User exists but wrong password, log the error
                    if (!PgUsers.validPassword(password, user.user_password)) {
                        return done(null, false, {message: 'Неправильный пароль.'});
                    }
                    if (user.disabled) {
                        return done(null, false, {message: (user.disabled_message ? user.disabled_message : 'Вы отключены от системы!')});
                    }
                    return done(null, user.user_id, {message: 'Успешный вход.'});
                })
                .catch(function (err) {
                    done(null, false, {'message': 'Ошибка при входе: ' + err.message});
                })
        }));
}
;
