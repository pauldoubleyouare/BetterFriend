'use strict';

const express = require('express');
const router = express.Router();
const { Profile } = require('../models/profileModel');
const { User } = require('../models/userModel');

router.get('/', (req, res) => {
    Profile
        .find()
        .then(profiles => {
            res.json({
                profiles: profiles.map(profile => profile.serialize())
            });
            return profiles;
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err});
        });
    });

router.get('/:id', (req, res) => {
//     // when a client fetches this resource, it must have User ID
//     //we'll need to check and make sure that the req.params.id === req.body.id and that it's there
//     // we'll need to query the DB to find that user, and then once we find the user, we want to find all of the profiles attached to it
//     //I think we need to populate() both the userModel and the profileModel
//     //once we find the profiles inside of users, we will send that data in a json object 
//     // profile model, find inside of Mongo, using the profile model
//     // upon creation, it should be created by the specific user, and tied to that _id
//     // 
    Profile
        .findById(req.params.id)
        .then(profile => {
            res.json({
                profile: profile
            });
            return profile;
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err});
        });
});


router.post('/', (req, res) => {
    console.log("user Id", req.userId);
    console.log("params", req.params.id);
    // we need to find the User document by Id - make sure 1. it exists 2. that it's validated
    // Validate profile data, make sure we have the correct fields to create profile
    // Save the profile / and return it
    // make sure that the profile 'owner'is referenced to the req.params.id
    User
        .findById(req.userId)
        .then(user => 
            Profile.create(Object.assign({}, req.body, {owner: req.userId})))
        .then(profile => 
            res.json({profile: profile.serialize()}).status(201)
        )
        .catch(e => res.status(500).json({errors: e})
            // if user not found, respond with required fields etc.
        )
});

//finish wiring request body
//TESTS



router.put('/:id', (req, res) => {
    res.send('need to work');
});

router.delete('/:id', (req, res) => {
    res.send('need to work')
});






module.exports = router;