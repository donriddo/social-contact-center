const request = require('request');

//////////////////////////
// Sending helpers
////////////////////////

function sendGenericMessage(recipientId) {
  let messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'rift',
              subtitle: 'Next-generation virtual reality',
              item_url: 'https://www.oculus.com/en-us/rift/',
              image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://www.oculus.com/en-us/rift/',
                  title: 'Open Web URL',
                },
                {
                  type: 'postback',
                  title: 'Call Postback',
                  payload: '<GET_STARTED_PAYLOAD>',
                },
              ],
            },
            {
              title: 'touch',
              subtitle: 'Your Hands, Now in VR',
              item_url: 'https://www.oculus.com/en-us/touch/',
              image_url: 'http://messengerdemo.parseapp.com/img/touch.png',
              buttons: [
                {
                  type: 'web_url',
                  url: 'https://www.oculus.com/en-us/touch/',
                  title: 'Open Web URL',
                },
                {
                  type: 'postback',
                  title: 'Call Postback',
                  payload: 'Payload for second bubble',
                },
              ],
            },
          ],
        },
      },
    },
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: sails.config.settings.facebook.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData,

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let recipientId = body.recipient_id;
      let messageId = body.message_id;

      console.log('Successfully sent generic message with id %s to recipient %s',
        messageId, recipientId);
    } else {
      console.error('Unable to send message.');
      console.error('response: ', response.statusCode);
      console.error('error: ', error);
    }
  });
}

module.exports = {
  sendTextMessage(recipientId, messageText) {
    let messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
      },
    };

    callSendAPI(messageData);
  },

  // Incoming events handling
  receivedMessage(event) {
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfMessage = event.timestamp;
    let message = event.message;

    console.log('Received message for user %d and page %d at %d with message:',
      senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    // let messageId = message.mid;

    let messageText = message.text;
    let messageAttachments = message.attachments;

    if (messageText) {
      // If we receive a text message, check to see if it matches a keyword
      // and send back the template example. Otherwise, just echo the text we received.
      switch (messageText) {
        case 'generic':
          sendGenericMessage(senderID);
          break;

        default:
          this.sendTextMessage(senderID, messageText);
      }
    } else if (messageAttachments) {
      this.sendTextMessage(senderID, 'Message with attachment received');
    }
  },

  receivedPostback(event) {
    const self = this;
    let senderID = event.sender.id;
    let recipientID = event.recipient.id;
    let timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    let payload = event.postback.payload;

    console.log('Received postback for user %d and page %d with payload \'%s\' ' +
      'at %d', senderID, recipientID, payload, timeOfPostback);

    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful
    if (payload === '<GET_STARTED_PAYLOAD>') {
      request({
        uri: `https://graph.facebook.com/v2.6/${senderID}`,
        qs: {
          fields: sails.config.settings.facebook.fields,
          access_token: sails.config.settings.facebook.PAGE_ACCESS_TOKEN,
        },
        method: 'GET',

      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let data = JSON.parse(body);
          delete data.id;
          console.log('Successfully retrieved facebookProfile profile: ', data);
          let facebookProfileData = Object.assign(data, { psid: senderID });
          FacebookProfile.create(facebookProfileData).then(function (facebookProfile) {
            console.log('FacebookProfile created successfully: ', facebookProfile);
            self.sendTextMessage(senderID, `Welcome ${facebookProfile.first_name}`);
          }).catch(err => {
            console.error(err);
          });
        } else {
          console.error('Unable to set payload.');
          // console.error(response);
          // console.error(error);
        }
      });
    } else {
      this.sendTextMessage(senderID, 'Postback called');
    }

  },

};
