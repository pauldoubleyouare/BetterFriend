'use strict';

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise; // this is making Mongoose use ES6 promises

//we're pulling the DB URL from ./config and setting them as variables here via desructuring assignment
const { DATABASE_URL, TEST_DATABASE_URL, PORT } = require('./config');

const userRouter = require('./routes/userRoutes');

const app = express();

app.use(morgan('common'));
app.use(express.static('public')); //this is serving the static files in 'public'
app.use(express.json());

app.use('/api/users/', userRouter);

// we're calling server up here, then assigning a value to it inside of runServer, but closeServer also needs access to a server object
let server;

//datbaseUrl the argument/paramater, is getting fed from the if(require.main === module) line
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  //we're wrapping this with a promise, so we can run tests on it easily later
  return new Promise((resolve, reject) => {
    // we're starting our server with mongoose.connect - and if there's an error, return the error?
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        //we're setting app.listen - with our port to server
        server = app
          .listen(port, () => {
            console.log(`App is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

//this is closing the server, but I'm not sure where it's getting called exactly
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

//require is a function, and 'main' is a property on the require function
// checking to see if we're in a node.js environment - if we are, then open port
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

//this is exposing a variable that represents current module (module) and exports is an object that gets exposed as a module
module.exports = { app, runServer, closeServer };
