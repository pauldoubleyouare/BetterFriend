'use strict';

let express = require('express');
let router = express.Router();

const { User } = require('../models/userModel')
const { Profile } = require('../models/profileModel');

router.get('/:id', (req, res) => {
    // when a client fetches this resource, it must have User ID
    //we'll need to check and make sure that the req.params.id === req.body.id and that it's there
    // we'll need to query the DB to find that user, and then once we find the user, we want to find all of the profiles attached to it
    //I think we need to populate() both the userModel and the profileModel
    //once we find the profiles inside of users, we will send that data in a json object 
    // profile model, find inside of Mongo, using the profile model
    // upon creation, it should be created by the specific user, and tied to that _id
    // 
    let userId = req.body.id;
    User
        .findById(userId)
        .then(console.log(userId))
        .catch()

        });



router.post('/', (req, res) => {
    res.send('need to work');
})

router.put('/', (req, res) => {
    res.send('need to work');
})

router.delete('/', (req, res) => {
    res.send('need to work')
})






module.exports = router; 