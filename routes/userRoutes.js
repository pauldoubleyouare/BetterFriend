'use strict';

const express = require('express');
const router = express.Router();
const profileRoutes = require('./profileRoutes')
const { User } = require('../models/userModel');

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
    User
        .findById(id)
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "internal server error"});
        });
});


router.post('/', (req, res) => {
    const requiredFields = ['userName', 'fullName', 'email'];
    // console.log(req.body);
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        } else console.log("Request recieved");
    });
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
                    .then(user => res.status(201).json(user.serialize())
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({error: 'internal server error'});
                    }));
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
        .catch(err => res.status(500).json({message: 'Internal server error'}))
});



router.delete('/:id', (req, res) => {
    User
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(204).json({message: `${req.params.id} has been deleted`});
            console.log(`${req.params.id} has been deleted`);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'yeah, something got messed up'});
        });
});

module.exports = router;