const Twitter = require('twitter-node-client').Twitter;
const twitter = new Twitter(sails.config.settings.twitter);

module.exports = {
  sendDirectMessage(screenName, message, callback, res) {
    twitter.postCustomApiCall(
      '/direct_messages/new.json',
      { screen_name: screenName, text: message },

      function (error, response, body) {
        console.log('ERROR: %s', error, body);
        return callback(
          400, res, 'An error occured', error
        );
      },

      function (data) {
        console.log('DATA: %s', data);
        return callback(
          200, res, 'Message sent successfully', data
        );
      }
    );
  },
};
