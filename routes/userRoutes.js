'use strict';

const express = require('express');
const router = express.Router();
const profileRoutes = require('./profileRoutes')
const { User } = require('../models/userModel');
const { Profile } = require('../models/profileModel');

router.use('/:id/profiles/', (req, res, next) => {
    req.userId = req.params.id;

    next();
}, profileRoutes)
// inside of a profile route - GET all profiles of this user /api/users/:id/profiles/


router.get('/', (req, res) => {
    User
        .find()
        .then(users => {
            res.json({
                users: users.map(user => user.serialize())
            });
            // console.log(users);

            return users;
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err});
        })
});

router.get('/:id', (req, res) => {
    let id = req.params.id;
    // console.log('id', id);
    User
        .findById(id)
        .then(user => {
            // console.log('user', user)
            //get all profiles for this user
            //get wishlist items for the profile
           return Profile
                .find({owner: id})
                .then(profiles => {
                    //put them inside of the User object
                    user.profiles = profiles;
                    // console.log(profiles);
                    //return the user
                    return user;
                });
        })
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "internal server error"});
        });
});


router.post('/', (req, res, next) => {
    const requiredFields = ['userName', 'fullName', 'password', 'email']; //creating a model for the required fields
    const missingField = requiredFields.find(field => (!field in req.body)); //check to see if there are missing fields inside of req.body

// ===========Login/user credential validation=============//
    if (missingField) { //if there are missing fields
        const err = new Error(`Missing ${missingField} in request body`); //create a new error message
        err.status = 422; //send 422 - unprocessable entity
        return next(err); //end this middleware function and return the error
    }

    const stringFields = ['userName', 'password', 'fullName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== "string"
    );

    if (nonStringField) {
        const err = new Error(`Field: ${nonStringField} must be type String`);
        err.status = 422;
        return next(err);
    }

    const explicitlyTrimmedFields = ['userName', 'password'];
    const nonTrimmedField = explicitlyTrimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if (nonTrimmedField) {
        const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with a 'space'`);
        err.status = 422;
        return next(err);
    }

    const sizedFields = {
        userName: { min: 1 },
        password: { min: 8, max: 72 }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
    );
    if (tooSmallField) {
        const min = sizedFields[tooSmallField].min;
        const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
        err.status = 422;
        return next(err);
    }

    const tooLargeField = Object.keys(sizedFields).find(
        field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
    );

    if (tooLargeField) {
        const max = sizedFields[tooLargeField].max;
        const err = new Error(`Field: '${tooLargeField}' must be less than ${max} characters`);
        err.status = 422;
        return next(err);
    }

    let { userName, password, fullName = "" } = req.body;
    fullName = fullName.trim();


    User
        .findOne({userName: req.body.userName})
        .then(user => {
            if (user) {
                const message = `${req.body.userName} is already taken, please choose a new username`;
                console.log(message);
                return res.status(400).send(message);
            } 
            else {
                User
                    .create({
                        userName: req.body.userName,
                        fullName: {
                            firstName: req.body.fullName.firstName,
                            lastName: req.body.fullName.lastName
                        },
                        email: req.body.email
                    })
                    .then(user => res.status(201).json(user.serialize()));
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something is not right'});
        });
});

router.put('/:id', (req, res) => {
    console.log('PUT request received');
    //take the req.params.id, query the database to find the user with the matching Id, if it finds a matching id
    //then we'll update the document in our DB with the data that was sent over in the request
    //if we do not find an object matching that ID, then we will throw a response to the client saying we couldn't find it
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `You're missing some fields or they don't match. Id in request parameter (${req.params.id}) must match the ID in the body (${req.body.id})`;
        console.error(message);
        res.status(400).json({message: message});
    }

    const fieldsToUpdate = {};
    const updateableFields = ['userName', 'fullName', 'email'];
    updateableFields.forEach(field => {
        if(field in req.body) {
            fieldsToUpdate[field] = req.body[field];
        } 
    });

    User
        .findByIdAndUpdate(req.params.id, {$set: fieldsToUpdate})
        .then(user => {
            console.log(user);
            return res.status(204).end()})
        .catch(err => res.status(500).json({message: err + 'Internal server error'}))
});



router.delete('/:id', (req, res) => {
    User
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`${req.params.id} has been deleted`);
            return res.status(200).json({message: `${req.params.id} has been deleted`});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'yeah, something got messed up'});
        });
});

module.exports = router;