var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var authenticate = function (email, password, done) {
  User.findOne({ email: email, isDeleted: false }).populateAll({ isDeleted: false })
    .then(function find(user) {

      if (!user) {
        return done(null, false);
      }

      if (!user.verifyPassword(password)) {
        console.log('password not match');
        return done(null, false);
      }

      return done(null, user.toJSON());
    }).catch(function (err) {
      console.log(err);
      return done(err);
    });
};


passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, function (email, password, done) {
  authenticate(email, password, done);
}));
