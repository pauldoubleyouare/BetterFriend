'use strict';

const { User } = require('../models/userModel');

function localAuth(req, res, next) {
  const { userName, password } = req.body;

  if (!userName && !password) {
    const err = new Error('No credentials provided');
    err.status = 400;
    return next(err);
  }

  let user;
  return User.findOne({ userName })
    .then(_user => {
      user = _user;

      if(!user) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.location = 'userName';
        return Promise.reject(err);
      }

      return user.validatePassword(password);
    })
    .then(isValid => {

      if (!isValid) {
        const err = new Error('Invalid credentials');
        err.status = 401;
        err.location = 'password';
        return Promise.reject(err);
      }

      req.user = user;
      next();
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = localAuth;