module.exports = {
  jsonResolveError: function (err, Model, res) {
    var response = {
      response: {
        message: 'Validation error has occured',
      },
    };
    if (err.invalidAttributes) {
      err.invalidAttributes = _validator(Model, err.invalidAttributes);
      response.response.message = 'Validation error has occured';
      response.response.errors = err.invalidAttributes;
      sails.log(response);
      return res.send(400, response);
    } else {
      var myErr = JSON.parse(JSON.stringify(err));
      if ((myErr.status == 500) && (myErr.raw.code == 11000)) {
        response.response.error = 'The record has already been registered';
        sails.log(response);
        return res.send(400, response);
      }

      sails.log(err);
      return res.negotiate(err);
    }
  },

  uniquenessError: function (fieldName, Model, res) {
    var response = {
      response: {
        message: 'Validation error has occured',
        errors: {},
      },
    };
    var message = Model.validationMessages[fieldName].unique;
    response.response.errors[fieldName] = [
      {
        rule: 'unique',
        message: message,
      },
    ];
    sails.log(response);
    return res.json(response, 400);
  },
};
