/**
 * Facebook Controller — Event handlers
 */

module.exports = {
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
    let { userID, message } = req.body;
    FacebookProfile.findOne({ psid: userID }).then(customer => {
      if (!customer)
        return ResponseService.json(404, res, 'Customer not found');
      FacebookService.sendTextMessage(userID, message);
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
