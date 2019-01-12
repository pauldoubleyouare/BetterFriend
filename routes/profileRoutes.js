'use strict';

const express = require('express');
const router = express.Router();
const { Profile } = require('../models/profileModel');
const { User } = require('../models/userModel');
const mongoose = require('mongoose');

let owner;

//GET Profiles
router.get('/', (req, res) => {
  owner = req.user.id;
  Profile.find({ owner })
    .then(profiles => {
      res.json(profiles);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

//GET Profile by ID
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The "id" is not valid');
    err.status = 400;
    return next(err);
  }

  Profile.findOne({ _id: req.params.id, owner: userId })
    .then(profile => {
      if (profile) {
        res.json(profile.serialize());
      } else {
        const err = new Error('No profiles with that "id" found');
        err.status = 404;
        next(err);
      }
    })
    .catch(err => {
      next(err);
    });
});

//POST new Profile
router.post('/', (req, res) => {
  owner = req.user.id;

  const requiredFields = ['firstName', 'lastName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Missing ${missingField} in request body`,
      location: missingField
    });
  }

  const stringFields = [
    'firstName',
    'lastName',
    'email',
    'relationship',
    'email',
    'phone',
    'imgUrl'
  ];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: `Incorrect field type: expected string`,
      location: nonStringField
    });
  }

  const newProfile = {
    owner: owner,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    relationship: req.body.relationship,
    birthday: req.body.birthday,
    address: {
      streetName: req.body.address.streetName,
      city: req.body.address.city,
      state: req.body.address.state,
      zipCode: req.body.address.zipCode
    },
    phone: req.body.phone,
    imgUrl: req.body.imgUrl
  };

  User.findById(owner)
    .then(() => {
      return Profile.create(newProfile);
    })
    .then(profile => res.status(201).json(profile.serialize()))
    .catch(e => res.status(500).json({ errors: e }));
});

// PUT updating a Profile
router.put('/:id', (req, res, next) => {
  const userId = req.user.id;
  const profileId = req.params.id;

  if (!(req.body._id && req.params.id && req.body._id === req.params.id)) {
    const err = new Error(
      `Request parameter id (${req.params.id}) should match request body id (${
        req.body._id
      }) and they both should exist`
    );
    err.status = 400;
    return next(err);
  }

  let updatedFields = {};
  let updateableFields = [
    'firstName',
    'lastName',
    'email',
    'relationship',
    'birthday',
    'address',
    'phone',
    'imgUrl'
  ];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updatedFields[field] = req.body[field];
    }
  });

  Profile.findOneAndUpdate(
    { _id: profileId, owner: userId },
    { $set: updatedFields }
  )
    .then(() => {
      return res.status(202).json(`Profile ${profileId} updated`);
    })
    .catch(err =>
      res.status(500).json({ error: err + 'Internal server error' })
    );
});

//DELETE Profile
router.delete('/:id', (req, res, next) => {
  const userId = req.user.id;
  const profileId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    const err = new Error('The "id" is not valid');
    err.status = 400;
    return next(err);
  }

  Profile.findOneAndRemove({ _id: profileId, owner: userId })
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

// Wish endpoints
router.post('/:id/wishItem', (req, res, next) => {
  const newWishItem = req.body.wishItem;
  const userId = req.user.id;
  const profileId = req.params.id;

  if (!newWishItem) {
    const err = new Error(`Missing wishItem in request body`);
    err.status = 400;
    return next(err);
  }
  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    const err = new Error('Id is not valid');
    err.status = 400;
    return next(err);
  }

  Profile.findOneAndUpdate(
    { _id: profileId, owner: userId },
    {
      $push: {
        wishList: {
          wishItem: req.body.wishItem
        }
      }
    },
    { new: true }
  )
    .then(profile => {
      //
      let oldestCreatedDate = new Date(profile.wishList[0].createdAt);
      let currentIndexObject = 0;
      for (let i = 1; i < profile.wishList.length; i++) {
        let currentItemDate = new Date(profile.wishList[i].createdAt);
        if (oldestCreatedDate < currentItemDate) {
          oldestCreatedDate = currentItemDate;
          currentIndexObject = i;
        }
      }
      
      res.status(201).json(
        profile.wishList[currentIndexObject]
      );
      return profile;
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

router.delete('/:id/wishItem', (req, res, next) => {
  const userId = req.user.id;
  const profileId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    const err = new Error('The ID is not valid');
    err.status = 400;
    return next(err);
  }

  Profile.findOneAndUpdate(
    { _id: profileId, owner: userId },
    {
      $pull: {
        wishList: {
          _id: req.body._id
        }
      }
    },
    { new: true }
  )
    .then(profile => {
      res.status(204).json({
        profile: profile.serialize()
      });
      return profile;
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
