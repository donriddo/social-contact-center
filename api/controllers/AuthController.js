/**
 * Authentication Controller
 */
module.exports = {

  login: function (req, res) {
    passport.authenticate('local', { session: false }, function (err, user, info) {

      /* istanbul ignore if */

      if (err) {
        req.session.flash = { err: err };
        return res.redirect('/api/showLogin');
      }
      if (info) {
        req.session.flash = { err: info };
        return res.redirect('/api/showLogin');
      }
      if (!user) {
        req.session.flash = { err: info };
        return res.redirect('/api/showLogin');
      }

      var token = JwtService.issue({ id: user.id });
      if (_.has(req.headers, 'x-mobile')) {
        token = JwtService.issue({ id: user.id }, sails.config.settings.jwt.expiry);
      }
      req.session.authorization = 'Bearer '.concat(token);

      if (_.includes(user.roles, 'customer')) {
        Customer.findOne({ id: user.customer.id }).populate('applications')
          .then(customer => {
            if (customer.applications.length) return res.redirect('/home');
            return res.view('customer/dashboard-calculate', {
              _user: user,
              application: {
                status: false,
                assetsUploaded: false,
                incomeUploaded: false,
                id: 0
              }
            });
          })
          .catch(err => {
            req.session.flash = { err: err };
            return res.redirect('/api/logout');
          });
      }
      if (_.includes(user.roles, 'consultant')) {
        return res.redirect('/dashboard/admin/home');
      }
    })(req, res);
  },

  logout(req, res) {
    delete req.session.authorization;
    res.redirect('/api/showLogin');
  },

  pusherAuth: function (req, res) {
    PusherService.auth(req.body, req.user, function (err, auth) {
      return res.status(200).json(auth);
    });
  }
};
