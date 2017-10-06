const Twit = require('twit');

const OAuth = require('OAuth');
const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  sails.config.settings.twitter.consumerKey,
  sails.config.settings.twitter.consumerSecret,
  '1.0A',
  sails.config.settings.twitter.callBackUrl,
  'HMAC-SHA1'
);

module.exports = {
  sendMessage(handle, message, setup) {
    const Twitter = new Twit({
      consumer_key: sails.config.settings.twitter.consumerKey,
      consumer_secret: sails.config.settings.twitter.consumerSecret,
      access_token: setup.accessToken,
      access_token_secret: setup.accessSecret,
    });

    Twitter.post(
      'direct_messages/new',
      { screen_name: handle, text: message },
      function (err, data, response) {
        if (err) console.log('Error sending message', err);
        console.log(response);
      }
    );
  },

  sendDirectMessage(handle, message, setup, callback, res) {
    this.sendMessage(handle, message, setup);
    callback(200, res, 'Message sent successfully');

  },

  getRequestToken() {

    return new Promise((resolve, reject) => {
      oauth.getOAuthRequestToken(
        function (e, authToken, authSecret, response) {
          if (e) {
            console.error(e);
            return reject(e);
          }

          console.log({ authToken, authSecret });
          return resolve({ authToken, authSecret, response });
        });
    });
  },

  getAccessToken(config) {

    return new Promise((resolve, reject) => {
      oauth.getOAuthAccessToken(config.authToken, config.authSecret, config.authVerifier,
        function (e, accessToken, accessSecret, response) {
          if (e) {
            console.error(e);
            return reject(e);
          }

          console.log({ accessToken, accessSecret });
          return resolve({ accessToken, accessSecret, response });
        });
    });
  },

  setAccessToken() {
    const self = this;
    Setup.findOne({ twitterConnected: true }).then(setup => {
      return [self.getAccessToken(setup), setup];
    }).spread((data, setup) => {
      console.log('Data: ', data);
      return Setup.update(setup.id, data);
    }).then(setup => {
      if (!setup.length) {
        console.log('No setup found');
      } else {
        console.log('Access tokens saved successfully', setup[0]);
      }
    }).catch(err => {
      console.log('Error settingaccess tokens: ', err);
    });

  },
};
