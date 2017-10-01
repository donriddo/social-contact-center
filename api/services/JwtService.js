let tokenBuffer = new Buffer(sails.config.settings.jwt.secret, 'base64');
let tokenExpiry = sails.config.settings.jwt.expiry;
let audience = sails.config.settings.jwt.domain;
let issuer = sails.config.settings.jwt.host;
module.exports = {
  issue: function (payload, expirytime, subject) {
    let token = _jwt.sign(payload, tokenBuffer, {
      expiresIn: expirytime || tokenExpiry,
      audience: audience,
      issuer: issuer,
      jwtid: _uuid.v4(),
      subject: subject || 'jwt-auth-token',
    });
    return token;
  },

  verify: function (token, cb) {
    cb = cb ? cb : function () {};

    _jwt.verify(token, tokenBuffer, { audience: audience, issuer: issuer },  function (err, decoded) {
      return cb(err, decoded);
    });
  },
};
