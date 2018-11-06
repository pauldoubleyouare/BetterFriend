'use strict';

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      firstName: { type: String, required: true },
      lastName: { type: String }
    },
    email: { type: String, required: true },
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      }
    ],
    created: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'User' }
);

// what this is doing, is creating a method .serialize that allows us
//to control what data we're going to be responding with (which gets called in server.js)
userSchema.methods.serialize = function() {
  return {
    id: this._id,
    userName: this.userName,
    fullName: this.fullName.firstName + ' ' + this.fullName.lastName,
    email: this.email,
    profiles: this.profiles
  };
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema, 'Users');

module.exports = { User };
