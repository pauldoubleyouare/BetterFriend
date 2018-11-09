'use strict';

const express = require('express');
const router = express.Router();
const profileRoutes = require('./profileRoutes');
const { User } = require('../models/userModel');
const { Profile } = require('../models/profileModel');

router.get('/', (req, res) => {
  User.find()
    .then(users => {
      res.json({
        users: users.map(user => user.serialize())
      });

      return users;
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

router.get('/:id', (req, res) => {
  let id = req.params.id;

  User.findById(id)
    .then(user => {
      return Profile.find({ owner: id }).then(profiles => {
        user.profiles = profiles;
        return user;
      });
    })
    .then(user => res.json(user.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'internal server error' });
    });
});

//*****How would I dig into the fullName object to make sure that firstName and lastName are there, right now throwing a 500  */
router.post('/', (req, res, next) => {
  const requiredFields = ['userName', 'fullName', 'password', 'email'];
  const missingField = requiredFields.find(field => !(field in req.body));
  console.log('MISSING FIELD>>>>>>>>>>>>>>', missingField);

  // ===========Login/user credential validation=============//
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing field in request body`,
      location: missingField
    });
  }

  const stringFields = ['userName', 'password', 'email'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  //******** next() calls the next middleware function, but is that where does this get error message get processed? inside of server.js? ******/
  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Incorect field type: expected string`,
      location: nonStringField
    });
  }

  const explicitlyTrimmedFields = ['userName', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Cannot start or end with a space`,
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    userName: { min: 3 },
    password: { min: 8, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  //****Don't quite understand how fullName will work, since I have it as another aboject fullName: {frstname, lastname} */
  //***** Also don't know what the fullName ="" does/is */
  let { userName, password, email } = req.body;
  let firstName = req.body.fullName.firstName.trim();
  let lastName = req.body.fullName.lastName.trim();
  // fullName = fullName.trim();

  return User.find({ userName })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'userName'
        });
      }
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        userName,
        password: hash,
        fullName: {
          firstName: req.body.fullName.firstName,
          lastName: req.body.fullName.lastName
        },
        email
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

//*****NEED TO ADD/UPDATE PASSWORD */
router.put('/:id', (req, res) => {
  console.log('PUT request received');
  //take the req.params.id, query the database to find the user with the matching Id, if it finds a matching id
  //then we'll update the document in our DB with the data that was sent over in the request
  //if we do not find an object matching that ID, then we will throw a response to the client saying we couldn't find it
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `You're missing some fields or they don't match. Id in request parameter (${
      req.params.id
    }) must match the ID in the body (${req.body.id})`;
    console.error(message);
    res.status(400).json({ message: message });
  }

  const fieldsToUpdate = {};
  const updateableFields = ['userName', 'fullName', 'email'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      fieldsToUpdate[field] = req.body[field];
    }
  });

  User.findByIdAndUpdate(req.params.id, { $set: fieldsToUpdate })
    .then(user => {
      console.log(user);
      return res.status(204).end();
    })
    .catch(err =>
      res.status(500).json({ message: err + 'Internal server error' })
    );
});

//****NEED TO ADD / UPDATE PASSWORD */
router.delete('/:id', (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`${req.params.id} has been deleted`);
      return res
        .status(200)
        .json({ message: `${req.params.id} has been deleted` });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'yeah, something got messed up' });
    });
});

module.exports = router;
