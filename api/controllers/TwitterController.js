/**
 * TwitterProfileController
 *
 * @description :: Server-side logic for managing twitterProfiles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


  /**
  * @api {post} /twitterProfile Create twitterProfile
  * @apiName Create TwitterProfile
  * @apiGroup TwitterProfile
  * @apiVersion 0.0.1
  *
  * @apiUse TwitterProfileParams
  *
  * @apiUse TwitterProfileSuccessResponse
  *
  * @apiUse ValidationErrorExample
  */
  create(req, res) {
    let data = req.body;
    TwitterProfile.create(data).then((twitterProfile) => {
      return ResponseService.json(
        200, res, 'Twitter Profile created successfully', twitterProfile
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, TwitterProfile, res);
    });
  },

  /**
  * @api {put} /twitterProfile/:id Update twitterProfile
  * @apiName Update TwitterProfile
  * @apiGroup TwitterProfile
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id             twitterProfile's id
  *
  * @apiUse TwitterProfileParams
  *
  * @apiUse TwitterProfileSuccessResponse
  *
  * @apiUse ValidationErrorExample
  * @apiUse NotFoundExample
  */
  update(req, res) {
    let data = req.body;
    TwitterProfile.update({
      id: req.param('id'),
    }, data).then((updatedTwitterProfile) => {
      if (!updatedTwitterProfile.length) {
        return ResponseService.json(404, res, 'TwitterProfile not found');
      }

      return ResponseService.json(
        200, res, 'Updated twitterProfile successfully', updatedTwitterProfile[0]
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, TwitterProfile, res);
    });
  },

  /**
  * @api {get} /twitterProfile/:id Fetch twitterProfile
  * @apiName Fetch TwitterProfile
  * @apiGroup TwitterProfile
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id      twitterProfile's id
  *
  * @apiUse TwitterProfileSuccessResponse
  *
  * @apiUse NotFoundExample
  */
  view(req, res) {
    QueryService.findOne(TwitterProfile, req).then(twitterProfile => {
      if (!twitterProfile) {
        return ResponseService.json(404, res, 'TwitterProfile not found');
      }

      return ResponseService.json(
        200, res, 'TwitterProfile retrieved successfully', twitterProfile
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, TwitterProfile, res);
    });
  },

  /**
  * @api {get} /twitterProfile Fetch all twitterProfiles
  * @apiName Fetch All TwitterProfile
  * @apiGroup TwitterProfile
  * @apiVersion 0.0.1
  *
  * @apiUse TwitterProfileSuccessResponse
  * @apiUse NotFoundExample
  */
  list(req, res) {
    var conditions = {};
    QueryService.find(TwitterProfile, req, conditions).then(records => {
      return ResponseService.json(
        200,
        res,
        'TwitterProfiles retrieved successfully',
        records.data,
        records.meta
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, TwitterProfile, res);
    });
  },

  /**
  * @api {delete} /twitterProfile/:id Remove twitterProfile
  * @apiName Remove TwitterProfile
  * @apiGroup TwitterProfile
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id      employee's id
  *
  * @apiUse TwitterProfileParams
  *
  * @apiSuccessExample Success-Response
  * HTTP/1.1 200 OK
  * {
  *    "response": {
  *       "message": "TwitterProfile removed successfully",
  *       "data": {
  *          "isDeleted": "true",
  *          "createdAt": "2015-01-07T09:43:40.100Z",
  *          "updatedAt": "2015-01-07T09:43:40.100Z",
  *          "id": "54acffcc902ab22e59bc507a"
  *       }
  *    }
  * }
  *
  * @apiUse NotFoundExample
  */
  delete(req, res) {
    let id = req.params.id;
    TwitterProfile.update(
      { id: id, isDeleted: false },
      { isDeleted: true }
    ).then((deletedTwitterProfile) => {
      if (!deletedTwitterProfile.length) {
        return ResponseService.json(404, res, 'TwitterProfile not found');
      }

      return ResponseService.json(
        200, res, 'TwitterProfile removed successfully', deletedTwitterProfile[0]
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, TwitterProfile, res);
    });
  },

  message(req, res) {
    let { handle, message } = req.body;
    TwitterProfile.findOne({ handle: handle }).then(customer => {
      if (!customer) {
        console.log('Customer not found');
        return false;
      }

      return Setup.findOne({ twitterConnected: true });
    }).then(setup => {
      if (!setup)
        return ResponseService.json(
          404, res, 'Customer/Setup not found'
        );
      TwitterService.sendDirectMessage(
        handle, message, setup, ResponseService.json, res
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(
        err, TwitterProfile, res
      );
    });
  },

  broadcast(req, res) {
    let { message } = req.body;
    Setup.findOne({ twitterConnected: true }).then(setup => {
      return [setup, TwitterProfile.find()];
    }).spread((setup, customers) => {
      if (!customers.length)
        return ResponseService.json(404, res, 'No Customers found');
      customers.forEach(function (customer) {
        TwitterService.sendMessage(
          customer.handle, message, setup);
      }, this);

      return ResponseService.json(
        200, res, 'Message Broadcast successful'
      );
    });
  },

  getRequestToken(req, res) {
    let AuthToken = TwitterService.getRequestToken();
    AuthToken.then(data => {
      return Promise.all([Setup.update({ saasInitialized: true }, data), data]);
    }).then(data => {
      console.log(data[0]);
      return ResponseService.json(200, res, 'Token success', data[1]);
    }).catch(err => {
      return ResponseService.json(400, res, 'Token error', err);
    });
  },

  handleCallback(req, res) {
    console.log('GOT CALLBACK: ', req.query);
    Setup.update(
      { authToken: req.query.oauth_token },
      { authVerifier: req.query.oauth_verifier, twitterConnected: true }
    ).then(setup => {
      console.log(setup);
      if (!setup.length) return res.redirect('/');
      TwitterService.setAccessToken();
      return res.redirect('/#/dashboard/twitter');
    }).catch(err => {
      console.log('Error handling twitter callback', err);
      res.redirect('/');
    });
  },
};
