module.exports = {

  sendWelcomeEmail(values) {
    let subject = 'Voting App Registration';
    let message = `Hello ${values.firstName} ${values.lastName}<br><br>`;
    message += 'You have been created on the <b>Voting App</b>  as an Admin with details: <br>';
    message += `Email: <b>${values.email}<b><br>`;
    message += `Password: <b>${values.password}<b>`;
    message += 'Please login to continue or change your password.<br><br>Thanks.';
    let recipient = values.email;
    EmailService.sendSingleEmail(subject, message, recipient);
  },

};
