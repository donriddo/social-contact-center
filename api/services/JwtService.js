var jwt = require('jsonwebtoken');
const { secret, expiry } = sails.config.settings.jwt;

module.exports = {
  issueToken(payload, expirytime) {
    let expiryTime = (expirytime) ? expirytime : expiry;
    var token = jwt.sign(payload, process.env.TOKEN_SECRET || secret, {
      expiresIn: expiryTime,
    });
    return token;
  },

  verifyToken(token, cb) {
    return jwt.verify(token, process.env.TOKEN_SECRET || secret, {}, cb);
  },
};
