/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    firstName: {
      type: 'string',
      required: true,
    },
    lastName: {
      type: 'string',
      required: true,
    },
    dob: {
      type: 'date',
    },
    gender: {
      type: 'string',
      enum: ['male', 'female'],
    },
    maritalStatus: {
      type: 'string',
      enum: ['single', 'married', 'widow', 'divorced'],
    },
    lga: {
      type: 'string',
    },
    state: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    email: {
      type: 'string',
      required: true,
    },
    password: {
      type: 'string',
      required: true,
      minLength: 6,
      protected: true,
    },
    resetHash: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    role: {
      type: 'string',
      enum: ['saas', 'admin', 'member'],
      defaultsTo: 'member',
    },
    isActive: {
      type: 'boolean',
      defaultsTo: false,
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },
    getFullName: function () {
      return this.firstName + ' ' + this.lastName;
    },

    verifyPassword: function (pass, callback) {
      var obj = this.toObject();
      if (callback) {
        return _bcrypt.compare(pass, obj.password, callback);
      }

      return _bcrypt.compareSync(pass, obj.password);
    },

    toJSON: function () {
      var obj = this.toObject();
      delete obj.password;
      delete obj.verificationHash;
      delete obj._csrf;
      obj.fullName = this.getFullName();
      return obj;
    },

    hashPassword: function (pass) {
      var values = {
        password: pass,
      };
      if (!_.isNull(pass)) {
        hashPassword(values);
      }

      return values.password;
    },

    passwordReset: function (criteria) {
      let resetHash = _.sampleSize(
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
          .split(''), 7).join('');
      this.update(criteria, {
        resetHash: resetHash,
      });
      let recipient = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        fullName: this.getFullName(),
      };
      return EmailService.sendPasswordReset(recipient, null);
    },
  },

  beforeCreate: function (values, next) {
    if (values.password) {
      hashPassword(values);
    }

    next();
  },

  beforeUpdate: function (values, next) {
    if (values.password) {
      hashPassword(values);
    }

    next();
  },

  afterCreate: function (values, next) {
    NotificationService.sendVerification(values);
    next();
  },

  softDelete: function (criteria) {
    return this.update(criteria, {
      isDeleted: true,
    });
  },

  validationMessages: {
    firstName: {
      required: 'First name is required',
    },
    lastName: {
      required: 'Last name is required',
    },
    email: {
      required: 'Email is required',
      unique: 'Email must be unique',
    },
    password: {
      required: 'Password is required',
      minLength: 'Password is too short. Minimum length is 6',
    },
    bvn: {
      required: 'BVN is required',
    },
    verificationHash: {
      required: 'Verification Hash is required',
    },
    consultantType: {
      in: 'Consultant Type should be either ["chartered", "lawyer", practitioner]',
    },
  },
};

/*
 * hashPassword
 * Utility function for password hashing using the bcrypt module.
 */
function hashPassword(values) {
  let hash = _bcrypt.hashSync(values.password, 8);
  values.password = hash;
  return values;
}


