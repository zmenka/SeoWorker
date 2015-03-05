/**
 * Created by zmenka on 21.12.14.
 */
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var PgUsers = require('./db/postgres/pg_users');

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user_id, done) {
        done(null, user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (user_id, done) {
        return new PgUsers().get(user_id)
            .then(function (user) {
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
            console.log("passport login ", username, password )
            // check in db if a user with username exists or not
            new PgUsers().getByLogin(username)
                .then(function (users) {
                    // Username does not exist, log error & redirect back
                    if (users.length!=1) {
//                        console.log('User Not Found with username ' + username);
                        return done(null, false,
                            {'message': 'Пользователя с таким логином нет.'});
                    }
                    var user = users[0]
                    // User exists but wrong password, log the error
                    if (!new PgUsers().validPassword(password, user.user_password)) {
                        return done(null, false, { message: 'Неправильный пароль.' });
                    }
                    return done(null, user.user_id, { message: 'Успешный вход.' });
                })
                .catch(function (err) {
                    done(err, false, {'message': 'Ошибка при входе: ' + err});
                })
        }));

    passport.use('register', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'login',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            console.log("passport register ", username, password )
            // asynchronous
            // Delay the execution of function and execute
            // the method in the next tick of the event loop
            process.nextTick(function () {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                new PgUsers().getByLogin(username)
                    .then(function (users) {
                        // Username does not exist, log error & redirect back
                        if (users.length!=0) {
//                            console.log('User already exists with username ' + username);
                            return done(null, false,
                                {'message': 'Пользователь с таким логином уже есть.'});
                        } else {
                            // if there is no user with that email
                            // create the user
                            new PgUsers().insert(username, password, 1)
                                .then(function (user_id) {
                                    console.log('User Registration succesful');
                                    return done(null, user_id, {'message': 'Успешная регистрация.'});
                                })
                                .catch(function (err) {
                                    return done(null, false,
                                        {'message': 'Ошибка при сохранении пользователя: ' + err});
                                })
                        }
                    })
                    .catch(function (err) {
                        done(err, false, {'message': 'Ошибка при регистрации: ' + err});
                    })

            });
}
))

}
;
