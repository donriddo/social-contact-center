/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
const request = require('request');

module.exports.bootstrap = function (cb) {

  global._ = require('lodash');
  global._pager = require('sails-pager');
  global._bcrypt = require('bcryptjs');
  global._promise = require('bluebird');
  global._uuid = require('node-uuid');
  global.passport = require('passport');
  global.LocalStrategy = require('passport-local').Strategy;
  global._validator = require('sails-validation-messages');
  global._jwt = require('jsonwebtoken');

  var adminInitialize = setup => {

    let adminUser = {
      firstName: 'SAAS',
      lastName: 'User',
      email: 'donriddo@gmail.com',
      password: 'riddo2020',
      role: 'saas',
      address: '229 Herbert Macaulay, Yaba.',
      phone: '2348113070914',
    };

    request({
      uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
      qs: { access_token: sails.config.settings.facebook.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: {
        get_started: {
          payload: '<GET_STARTED_PAYLOAD>',
        },
      },

    }, function (error, response, body) {
      if (!error && response.statusCode == 200 && body.result) {
        console.log('Successfully set GET_STARTED payload: ', body);
      } else {
        console.error('Unable to set payload.');
        console.error(response);
        console.error(error);
      }
    });

    User.create(adminUser).then(user => {
      return [user, TwitterService.getRequestToken()];
    }).spread((user, token) => {
      return [
        Setup.update(
          setup.id,
          Object.assign(token, { saasInitialized: true })
        ), user,
      ];
    }).spread((setup, user) => {
      if (setup) console.log('SAAS user initialized successfully: ', user.id);
    }).catch(err => {
      console.log(err);
    });
  };

  Setup.find().then(setup => {
    if (setup.length) {
      if (setup[0].saasInitialized === false) {
        adminInitialize(setup[0]);
      }

    } else {
      Setup.create({}).then(newSetup => {
        adminInitialize(newSetup);
      });
    }

    cb();
  })
    .catch(function (err) {
      console.log('Error checking for setup');
      cb(err);
    });

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift,
  // since it's waiting on the bootstrap)
  // cb();
};
