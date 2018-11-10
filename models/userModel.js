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
    firstName: { type: String, default: "FIRSTNAME" },
    lastName: { type: String, default: "LASTNAME" },
    email: { type: String, required: true },
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      }
    ]
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  },
  { collection: 'User' }
);

userSchema.methods.serialize = function() {
  return {
    id: this._id,
    userName: this.userName,
    firstName: this.firstName,
    lastName: this.lastName,
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
