/**
 * Facebook Controller — Event handlers
 */

module.exports = {

  /**
  * @api {post} /facebookProfile Create facebookProfile
  * @apiName Create FacebookProfile
  * @apiGroup FacebookProfile
  * @apiVersion 0.0.1
  *
  * @apiUse FacebookProfileParams
  *
  * @apiUse FacebookProfileSuccessResponse
  *
  * @apiUse ValidationErrorExample
  */
  create(req, res) {
    let data = req.body;
    FacebookProfile.create(data).then((facebookProfile) => {
      return ResponseService.json(
        200, res, 'Facebook Profile created successfully', facebookProfile
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, FacebookProfile, res);
    });
  },

  /**
  * @api {put} /facebookProfile/:id Update facebookProfile
  * @apiName Update FacebookProfile
  * @apiGroup FacebookProfile
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id             facebookProfile's id
  *
  * @apiUse FacebookProfileParams
  *
  * @apiUse FacebookProfileSuccessResponse
  *
  * @apiUse ValidationErrorExample
  * @apiUse NotFoundExample
  */
  update(req, res) {
    let data = req.body;
    FacebookProfile.update({
      id: req.param('id'),
    }, data).then((updatedFacebookProfile) => {
      if (!updatedFacebookProfile.length) {
        return ResponseService.json(404, res, 'FacebookProfile not found');
      }

      return ResponseService.json(
        200, res, 'Updated facebookProfile successfully', updatedFacebookProfile[0]
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, FacebookProfile, res);
    });
  },

  /**
  * @api {get} /facebookProfile/:id Fetch facebookProfile
  * @apiName Fetch FacebookProfile
  * @apiGroup FacebookProfile
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id      facebookProfile's id
  *
  * @apiUse FacebookProfileSuccessResponse
  *
  * @apiUse NotFoundExample
  */
  view(req, res) {
    QueryService.findOne(FacebookProfile, req).then(facebookProfile => {
      if (!facebookProfile) {
        return ResponseService.json(404, res, 'FacebookProfile not found');
      }

      return ResponseService.json(
        200, res, 'FacebookProfile retrieved successfully', facebookProfile
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, FacebookProfile, res);
    });
  },

  /**
  * @api {get} /facebookProfile Fetch all facebookProfiles
  * @apiName Fetch All FacebookProfile
  * @apiGroup FacebookProfile
  * @apiVersion 0.0.1
  *
  * @apiUse FacebookProfileSuccessResponse
  * @apiUse NotFoundExample
  */
  list(req, res) {
    var conditions = {};
    QueryService.find(FacebookProfile, req, conditions).then(records => {
      return ResponseService.json(
        200,
        res,
        'FacebookProfiles retrieved successfully',
        records.data,
        records.meta
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, FacebookProfile, res);
    });
  },

  /**
  * @api {delete} /facebookProfile/:id Remove facebookProfile
  * @apiName Remove FacebookProfile
  * @apiGroup FacebookProfile
  * @apiVersion 0.0.1
  *
  * @apiParam {String} id      employee's id
  *
  * @apiUse FacebookProfileParams
  *
  * @apiSuccessExample Success-Response
  * HTTP/1.1 200 OK
  * {
  *    "response": {
  *       "message": "FacebookProfile removed successfully",
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
    FacebookProfile.update(
      { id: id, isDeleted: false },
      { isDeleted: true }
    ).then((deletedFacebookProfile) => {
      if (!deletedFacebookProfile.length) {
        return ResponseService.json(404, res, 'FacebookProfile not found');
      }

      return ResponseService.json(
        200, res, 'FacebookProfile removed successfully', deletedFacebookProfile[0]
      );
    }).catch(err => {
      return ValidationService.jsonResolveError(err, FacebookProfile, res);
    });
  },

  verifyToken(req, res) {
    const VERIFY_TOKEN = sails.config.settings.facebook.VERIFY_TOKEN;
    if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VERIFY_TOKEN) {
      console.log('Validating webhook');
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error('Failed validation. Make sure the validation tokens match.');
      res.status(403).send({});
    }
  },
  receiveMessage(req, res) {
    let data = req.body;
    // Make sure this is a page subscription
    if (data.object === 'page') {

      // Iterate over each entry - there may be multiple if batched
      data.entry.forEach(function (entry) {
        let pageID = entry.id;
        let timeOfEvent = entry.time;

        // Iterate over each messaging event
        if (entry.messaging) {
          entry.messaging.forEach(function (event) {
            if (event.message) {
              FacebookService.receivedMessage(event);
            } else if (event.postback) {
              FacebookService.receivedPostback(event);
            } else {
              console.log('Webhook received unknown event: ', event);
            }
          });
        }
      });

      // Assume all went well.
      //
      // You must send back a 200, within 20 seconds, to let us know
      // you've successfully received the callback. Otherwise, the request
      // will time out and we will keep trying to resend.
      res.status(200).send({});
    } else {
      res.status(400).json({});
    }
  },

  message(req, res) {
    let { psid, message } = req.body;
    console.log('Body: ', psid, message);
    FacebookProfile.findOne({ psid: psid }).then(customer => {
      console.log('Customer: ', customer);
      if (!customer)
        return ResponseService.json(404, res, 'Customer not found');
      FacebookService.sendTextMessage(psid, message);
      return ResponseService.json(
        200, res, 'Message sent successfully'
      );
    });
  },

  broadcast(req, res) {
    let { message } = req.body;
    FacebookProfile.find().then(customers => {
      if (!customers.length)
        return ResponseService.json(200, res, 'No Customers found');
      customers.forEach(customer => {
        FacebookService.sendTextMessage(customer.psid, message);
      });
      return ResponseService.json(
        200, res, 'Messages broadcast successfully'
      );

    }).catch(err => {
      return ValidationService.jsonResolveError(err, FacebookProfile, res);
    });
  },
};
