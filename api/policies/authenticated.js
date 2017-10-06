/**
* Allow any authenticated user.
*/

module.exports = function (req, res, next) {
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {

      var scheme = parts[0];
      var credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        let token = credentials;
        JwtService.verifyToken(token, function (err, decoded) {
          if (err) {
            return res.json(401, { response: { message: err.message } });
          }

          req.user = decoded;
          next();
        });
      } else {
        return res.json(401, { response: { message: 'Format is Authorization: Bearer [token]' } });
      }
    } else {
      return res.json(401, { response: { message: 'Format is Authorization: Bearer [token]' } });
    }
  } else {
    return res.json(401, { response: { message: 'No Authorization header was found' } });
  }
};
