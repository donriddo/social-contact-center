/**
 * TwitterProfile.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  schema: false,
  attributes: {
    handle: {
      type: 'string',
      unique: true,
    },
  },
  validationMessages: {
    handle: {
      unique: 'Twitter handle already registered',
    },
  },
};

