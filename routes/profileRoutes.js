'use strict';

const express = require('express');
const router = express.Router();
const { Profile } = require('../models/profileModel');
const { User } = require('../models/userModel');

let owner;

router.get('/', (req, res) => {
  owner = req.user.id;
  console.log('OWNER>>>>>>', owner);
  Profile.find({ owner })
    .then(profiles => {
      res.json({
        profiles: profiles.map(profile => profile)
      });
      return profiles;
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

router.get('/:id', (req, res) => {
  Profile.findById(req.params.id)
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

router.post('/', (req, res) => {
  owner = req.user._id;
  User.findById(owner)
    .then(user => {
      return Profile.create(Object.assign({}, req.body, { owner: owner }));
    })
    .then(profile => res.status(201).json({ profile: profile.serialize() }))
    .catch(e => res.status(500).json({ errors: e }));
});

// Updating a Profile
router.put('/:id', (req, res) => {
  if (!(req.body.id && req.params.id && req.body.id === req.params.id)) {
    let message = `Request params:${req.params.id} should match request body: ${
      req.body.id
    } and they both should exist`;
    res.status(400).json({ message: message });
  }
  let updatedFields = {};
  let updateableFields = [
    'fullName',
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

  Profile.findByIdAndUpdate(req.params.id, { $set: updatedFields })
    .then(user => {
      return res.status(202).json('Updated:' + { user: user });
    })
    .catch(err =>
      res.status(500).json({ error: err + 'Internal server error' })
    );
});

router.delete('/:id', (req, res) => {
  Profile.findByIdAndRemove(req.params.id)
    .then(data =>
      res.status(200).json(data.fullName.firstName + ' was deleted')
    )
    .catch(err => res.status(500).json({ err: err }));
});

// Wish endpoints
// ****make sure the current user owns the profile that the wish is getting added to
// owner of profile should be current user (both post and delete)
// find by ownerID and profile - to ensure the current user is accessing the correct profile/wishitem
// so lost on this


router.delete('/:id/wishItem', (req, res) => {
  Profile.findByIdAndUpdate(
    req.params.id,
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
