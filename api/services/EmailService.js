const Sparkpost = require('sparkpost');
const EJS = require('ejs');
const fs = require('fs');


/*
 * Config
 */
const config = sails.config.settings.email;
const client = new Sparkpost(config.key);

module.exports = {
  client: new Sparkpost(config.key),

  /*******************************************************************
   *
   *                     Single emails
   *            Sparkpost [https://www.sparkpost.com]
   *
   *******************************************************************/
  sendSingleEmail: function (subject, message, recipients) {
    let transmission = {
      content: {
        html: message,
        subject: subject,
        from: config.sender,
      },
    };
    let messageRecipients;

    if (recipients instanceof Array) {
      messageRecipients = _.map(recipients, function (recipient) {
        return { address: recipient };
      });
    } else {
      messageRecipients = [{ address: recipients }];
    }

    transmission.recipients = messageRecipients;

    /*return new Promise(function (resolve, reject) {

        self.client.transmissions.send({
            transmissionBody: {content: messageContent, recipients: messageRecipients}
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result.body.results);
            }
        });
    });*/

    /*client.transmissions.send({
            content: messageContent,
            recipients: messageRecipients
        })
        .then(data => {

        })
        .catch(err => {

        });*/
    return new Promise(function (resolve, reject) {

      client.transmissions.send(transmission, function (err, result) {
        if (err) {
          reject(err);
        } else {
          // resolve(result.body.results);
          resolve(result);
        }
      });
    });
  },

  /**
   * Send user registration verification email
   * @param {String} email employer email
   * @param {Object} data Data to bind in template
   * @param {Function} cb callback
   */
  sendRegistrationEmail: function (recipient, data, cb) {
    cb = cb || function () { };

    let subject = 'Verify Your Account';

    let template = (data.resendVerification) ? config.templates.resendVerification : config.templates.verification;
    fs.readFile(template, config.encoding, function (err, _template) {
      if (err) {
        return sails.log.error(err);
      }

      let html = EJS.render(_template, data);
      return this.sendSingleEmail(subject, html, recipient, cb);
    }.bind(this));
  },


  /**
   * Send user password reset link
   * @param {String} email employer email
   * @param {Object} data Data to bind in template
   * @param {Function} cb callback
   */
  sendPasswordReset: function (recipient, data, cb) {
    cb = cb || function () { };

    let subject = 'Password Reset';

    fs.readFile(config.templates.passwordReset, config.encoding, function (err, _template) {
      if (err) {
        return sails.log.error(err);
      }

      let html = EJS.render(_template, data);
      return this.sendSingleEmail(subject, html, recipient, cb);
    }.bind(this));
  },


  /**
   * Send template email
   * @param {Object} to
   * @param {Object} template
   * @param {Object} globalMergeVars
   * @param {Function} cb
   */
  sendSingleTemplateEmail: function (recipient, templateName, globalMergeVars, cb) {
    let self = this;
    cb = cb || function () { };

    let reqOpts = {
      transmissionBody: {
        campaignId: templateName,
        from_email: config.from.email,
        from_name: config.from.name,
        recipients: [
          {
            address: {
              email: recipient.email,
              name: recipient.firstname + ' ' + recipient.lastname,
            },
          },
        ],
        global_merge_vars: globalMergeVars,
      },
    };

    return self.client.transmissions.send(reqOpts, function (err, result) {
      if (err) {
        return cb(err);
      }

      return cb(null, result);
    });
  },


  /*******************************************************************
   *
   *                     Batch emails
   *            Sparkpost [https://www.sparkpost.com]
   *
   *******************************************************************/

  // @TODO: Finish implementation for batches

  sendBatchTemplateEmail: function (toData, templateName, globalMergeVars, mergeVars, cb) {
    cb = cb || function () { };

    let msgObj = {
      auto_text: true,
      from: config.sender.email,
      from_name: config.sender.name,
      to: toData,
      headers: {
        'Reply-To': config.sender.email,
      },
      global_merge_vars: globalMergeVars,
      merge_vars: mergeVars,
      merge: true,
      merge_language: 'mailchimp',
    };
    return this.client.messages.sendTemplate({
      message: msgObj,
      async: false,
      template_name: templateName,
      template_content: [],
    }, function (result) {
      return cb(null, result);
    }, function (err) {

      return cb(err);
    });
  },

  /*
   * Send email to multiple recipients
   */
  sendBatchEmail: function (subject, message, fromData, to, replyToEmail, async, cb) {
    let msgObj = {
      html: message,
      auto_text: true,
      subject: subject,
      from_email: fromData.email,
      from_name: fromData.name,
      to: to,
      headers: {
        'Reply-To': config.sender.email,
      },
    };
    return this.client.messages.send({
      message: msgObj,
      async: async,
    }, function (result) {
      return cb(null, result);
    }, function (err) {

      return cb(err);
    });
  },

  /**
   * Send email with attachment
   */
  sendEmailAttachment: function (subject, message, fromData, toData, replyToEmail, attachment, async, cb) {
    let msgObj = {
      html: message,
      auto_text: true,
      subject: subject,
      from_email: fromData.email,
      from_name: fromData.name,
      to: [
        {
          email: toData.email,
          name: toData.name,
          type: 'to',
        },
      ],
      headers: {
        'Reply-To': config.sender.email,
      },
      attachments: {
        type: attachment.type,
        name: attachment.name,
        content: attachment.content,
      },
    };
    return this.client.messages.send({
      message: msgObj,
      async: async,
    }, function (result) {
      return cb(null, result);
    }, function (err) {

      return cb(err);
    });
  },








  /**
   * Send notification when then application is rejected
   * @param {String} email User email
   * @param {Object} tempData data to bind in template
   * @param {Function} cb callback
   */
  sendValidationRejectionNotification: function (email, tempData, cb) {
    cb = cb || function () { };

    let subject = 'Application Update';
    let from = {
      email: config.sender.email,
      name: config.sender.name,
    };
    let to = {
      email: email,
      name: null,
    };
    let template = 'assets/templates/email/application-rejected.ejs';

    fs.readFile(template, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }

      let msg = EJS.render(data, tempData);
      return this.sendSingleEmail(subject, msg, from, to,
        config.sender.email, false, cb);
    }.bind(this));
  },

  /**
   * Send Invitation email to contacts
   * @param {String} email employer email
   * @param {Object} tempData data to bind in template
   * @param {Function} cb callback
   */
  sendPaymentReceipt: function (email, tempData, cb) {
    cb = cb || function () { };

    let subject = 'Flutter Payment receipt';
    let from = {
      email: config.sender.email,
      name: config.sender.name,
    };

    let to = {
      email: email,
      name: null,
    };

    let template = 'assets/templates/email/payment-receipt.ejs';

    // generate message from template and send
    fs.readFile(template, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }

      let html = EJS.render(data, tempData);
      return this.sendSingleEmail(subject, html, from, to, config.sender.email, false, cb);
    }.bind(this));
  },
};
