'use strict';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const uuid = require('uuid');

let router = express.Router();


mongoose.Promise = global.Promise; // this is making Mongoose use ES6 promises

//we're pulling the DB URL from ./config and setting them as variables here via desructuring assignment
const { DATABASE_URL, TEST_DATABASE_URL, PORT } = require('./config');
const { User } = require('./models/userModel');
const { Profile } = require('./models/profileModel');


const app = express();

app.use(morgan('common'));
app.use(express.static('public')); //this is serving the static files in 'public'
app.use(express.json());



app.get('/users', (req, res) => {
    User
        .find()
        .then(users => {
            res.json({
                users: users.map(user => user.serialize())
            });
            console.log(users);
            return users;
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err});
        })
});

app.get('/users/:id', (req, res) => {
    let id = req.params.id;
    User
        .findById(id)
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "internal server error"});
        });
});


app.post('/users', (req, res) => {
    const requiredFields = ['userName', 'fullName', 'email'];
    console.log(req.body);
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

app.put('/users/:id', (req, res) => {
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


// we're calling server up here, then assigning a value to it inside of runServer, but closeServer also needs access to a server object
let server;

//datbaseUrl the argument/paramater, is getting fed from the if(require.main === module) line
function runServer(databaseUrl, port=PORT) {
    //we're wrapping this with a promise, so we can run tests on it easily later
    return new Promise((resolve, reject) => { 
        // we're starting our server with mongoose.connect - and if there's an error, return the error?
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            //we're setting app.listen - with our port to server
            server = app.listen(port, () => {
                console.log(`app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

//this is closing the server, but I'm not sure where it's getting called exactly
function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                reolve();
            });
        });
    });
}


//require is a function, and 'main' is a property on the require function
// checking to see if we're in a node.js environment - if we are, then open port
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

//this is exposing a variable that represents current module (module) and exports is an object that gets exposed as a module
module.exports = { app, runServer, closeServer };
