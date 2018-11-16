'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');

const localAuth = require('../middleware/local-auth');
const jwtAuth = require('../middleware/jwt-auth');

const config = require('../config');

const router = express.Router();

const createAuthToken = function(user) {
  return new Promise(function(resolve, reject) {
    jwt.sign(
      { user },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRY },
      function(err, token) {
        if (err) {
          return reject(err);
        }
        resolve(token);
      }
    );
  });
};

router.post('/login', localAuth, (req, res, next) => {
  createAuthToken(req.user)
    .then(authToken => {
      res.json({ authToken });
    })
    .catch(err => {
      next(err);
    });
});

router.post('/refresh', jwtAuth, (req, res, next) => {
  createAuthToken(req.user)
    .then(authToken => {
      res.json({ authToken });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
