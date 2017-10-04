/**
* Authentication Controller
*/

const passport = require('passport');
const jwt = require('jsonwebtoken');
const moment = require('moment');
module.exports = {

  /**
  * @api {post} /login Login
  * @apiName Log into the system
  * @apiGroup Auth
  * @apiVersion 0.0.1
  *
  * @apiParam {String} email User's email address
  * @apiParam {String} password user's password
  *
  *
  * @apiSuccessExample Success-Response
  * HTTP/1.1 200 OK
  * {
  *    response: {
  *        message: "Login Successful",
  *        data: {
  *          user: {
  *              "id": "slkdakd93j92d9n29necu9",
  *              "email": "email@example.com"
  *          },
  *          token: "JKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJsYXN0bmFtZSI6IaWDA4MTRmZDMi
  *          			LCJpYXQiOjE0MTg3c1MjA4MH0.Dj4niX-IgjHkaAu2fcWiZc29oq2h6M
  *          			uvsaXS3DD_glA"
  *          expiry: "1418913428"
  *        }
  *    }
  * }
  *
  * @apiErrorExample Error-Response
  * HTTP/1.1 404 Invalid Login
  * {
  *    response: {
  *        message: "Invalid login parameters"
  *    }
  * }
  *
  * @apiError (Error 400) {Object} response Variable holding response data
  * @apiError (Error 400) {String} response.message response message
  */
  login: function (req, res) {
    if (req.method == 'POST') {
      passport.authenticate('local', function (err, user, info) {
        if ((!user)) {
          return ResponseService.json(400, res, 'Invalid login parameters');
        }

        if (err) {
          return ResponseService.json(400, res, 'Error');
        } else {

          delete user.password;
          const { expiry, secret } = sails.config.settings.jwt;
          let token = jwt.sign(
            user, secret,
            { expiresIn: expiry }
          );

          let decodedToken = jwt.verify(token, secret, function (err, decoded) {
            req.user = user;
            return ResponseService.json(
              200, res, 'Login successful', { user: user, token: token, expiry: decoded.exp }
            );
          });
        }
      })(req, res);
    } else {
      return ResponseService.json(400, res, 'Not a proper http verb');
    }
  },


  /**
  * @api {post} /refresh_token Refresh token
  * @apiName Referesh A Token
  * @apiGroup Auth
  * @apiVersion 0.0.1
  *
  * @apiParam {String} token An active jwt token
  *
  *
  * @apiSuccessExample Success-Response
  * HTTP/1.1 200 OK
  * {
  *    response: {
  *        message: "Toke refreshed successfully",
  *        data: {
  *          user: {
  *              "id": "slkdakd93j92d9n29necu9",
  *              "email": "email@example.com"
  *          },
  *          token: "JKV1QiLCJhbGciOiJIUzI1NiJ9.eyJJsYXN0bmFtZSI6IaWDA4MTRmZDMi
  *          			LCJpYXQiOjE0MTg3c1MjA4MH0.Dj4niX-IgjHkaAu2fcWiZc29oq2h6M
  *          			uvsaXS3DD_glA"
  *          expiry: "1418913428"
  *        }
  *    }
  * }
  *
  * @apiErrorExample Error-Response
  * HTTP/1.1 404 Invalid Login
  * {
  *    response: {
  *        message: "Invalid token"
  *    }
  * }
  *
  * @apiErrorExample Error-Response
  * HTTP/1.1 404 Invalid Login
  * {
  *    response: {
  *        message: "Login is required"
  *    }
  * }
  *
  * @apiError (Error 400) {Object} response letiable holding response data
  * @apiError (Error 400) {String} response.message response message
  *
  * @apiUse NotFoundExample
  */
  refreshToken: function (req, res) {

    let secret = sails.config.settings.jwt.secret;
    // verify the existing token
    jwt.verify(req.body.token, secret, function (err, profile) {

      if (err) {
        return res.json(401, { response: { message: 'Invalid token' } });
      }

      //if more than 14 days old, force login
      if (!moment.unix(profile.iat).isBefore(moment.unix(profile.iat).add('14', 'days'))) {
        return ResponseService.json(401, res, 'Login is required');
      }

      // check if the user still exists
      User.findOne({ id: profile.id, isDeleted: false }).exec(function findCB(err, user) {

        if (err) {
          return ValidationService.jsonResolveError(err, User, res);
        }

        if (!user) {
          return ResponseService.json(404, res, 'User not found');
        }

        let refreshedToken = jwt.sign(
          user, secret, {
            expiresInMinutes: tokenExpiryInMinutes,
          }
        );
        let decodedToken = jwt.verify(refreshedToken, secret, function (err, decoded) {
          return ResponseService.json(
            200, res, 'Token refreshed successful',
            { user: user, token: refreshedToken, expiry: decoded.exp }
          );
        });
      });

    });
  },
};
