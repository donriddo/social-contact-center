const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false,
}, function (req, email, password, done) {
  User.findOne({
    email: email,
  }).then(function (user) {
    if (!user) {
      return done(null, false, {
        status: 401,
        message: 'Email account not found.',
      });
    }

    if (user.isDeleted) {
      return done(null, false, {
        status: 401,
        message: 'Email account not found.',
      });
    }

    if (!user.verifyPassword(password)) {
      return done(null, false, {
        status: 401,
        message: 'Invalid password.',
      });
    }

    return done(null, user.toJSON());
  }).catch(function (err) {
    return done(err, null);
  });
}));
