'use strict';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const uuid = require('uuid');


mongoose.Promise = global.Promise; // this is making Mongoose use ES6 promises

//we're pulling the DB URL from ./config and setting them as variables here via desructuring assignment
const { DATABASE_URL, TEST_DATABASE_URL, PORT } = require('./config');
const { User } = require('./models/userModel');
const { Profile } = require('./models/profileModel');


const app = express();

app.use(morgan('common'));
app.use(express.static('public')); //this is serving the static files in 'public'



app.get('/users', (req, res) => {
    User
        .find()
        .then(users => {
            res.json({
                users: users.map(user => user.serialize())
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'we really messed this up'});
        })
});

app.get('/users/:id', (req, res) => {
    User
        .findById(req.params.id)
        .then(user => res.json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "internal server error"});
        });
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
            //we're serring app.listen - with our port to server
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
