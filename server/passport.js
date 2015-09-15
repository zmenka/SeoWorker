/**
 * Created by zmenka on 21.12.14.
 */
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var PgUsers = require('./db/postgres/pg_users');
var PgGroups = require('./db/postgres/pg_groups');

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
        return new PgUsers().get(user_id)
            .then(function (user_res) {
                user = user_res
                return new PgGroups().listAdminGroups(user_id, user.role_id)
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
            new PgUsers().getByLogin(username)
                .then(function (users) {
                    // Username does not exist, log error & redirect back
                    if (users.length != 1) {
//                        console.log('User Not Found with username ' + username);
                        return done(null, false,
                            {'message': 'Пользователя с таким логином нет.'});
                    }
                    var user = users[0]
                    // User exists but wrong password, log the error
                    if (!new PgUsers().validPassword(password, user.user_password)) {
                        return done(null, false, {message: 'Неправильный пароль.'});
                    }
                    if (user.disabled) {
                        return done(null, false, {message: (user.disabled_message ? user.disabled_message : 'Вы отключены от системы!')});
                    }
                    return done(null, user.user_id, {message: 'Успешный вход.'});
                })
                .catch(function (err) {
                    done(err, false, {'message': 'Ошибка при входе: ' + err});
                })
        }));
}
;
