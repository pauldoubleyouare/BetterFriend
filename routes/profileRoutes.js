'use strict';

const express = require('express');
const router = express.Router();
const { Profile } = require('../models/profileModel');
const { User } = require('../models/userModel');
const mongoose = require('mongoose');

let owner;


router.get('/', (req, res, next) => {
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

router.post('/', (req, res) => {
  owner = req.user.id;
  User.findById(owner)
    .then(user => {
      return Profile.create(Object.assign({}, req.body, { owner: owner }));
    })
    .then(profile => res.status(201).json({ profile: profile.serialize() }))
    .catch(e => res.status(500).json({ errors: e }));
});

// Updating a Profile
router.put('/:id', (req, res) => {
  const userId = req.user.id;
  const profileId = req.params.id;
  if (!(req.body._id && req.params.id && req.body._id === req.params.id)) {
    let message = `Request params:${req.params.id} should match request body: ${
      req.body.id
    } and they both should exist`;
    res.status(400).json({ message: message });
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
    'wishList'
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
    .then(profile => {
      return res.status(202).json({ profile: profile.serialize() });
    })
    .catch(err =>
      res.status(500).json({ error: err + 'Internal server error' })
    );
});

router.delete('/:id', (req, res) => {
  const userId = req.user.id;
  const profileId = req.params.id;
  Profile.findOneAndRemove({ _id: profileId, owner: userId })
    .then(data => res.status(200).json(data.firstName + ' was deleted'))
    .catch(err => res.status(500).json({ err: err }));
});

// Wish endpoints
router.post('/:id/wishItem', (req, res, next) => {
  const newWishItem = req.body.wishItem;
  const userId = req.user.id;
  const profileId = req.params.id;

  if (!newWishItem) {
    const err = new Error(`Missing ${newWishItem} in request body`);
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
      res.json({
        profile: profile.serialize()
      });
      return profile;
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

//Need 3 things here - 1) userId from JWT 2) req.params.id (profileId) 3) wishId
router.delete('/:id/wishItem', (req, res) => {
  const userId = req.user.id;
  const profileId = req.params.id;
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
      res.json({
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
