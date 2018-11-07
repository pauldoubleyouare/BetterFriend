'use strict';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const { DATABASE_URL, TEST_DATABASE_URL, PORT } = require('./config');
const jwtAuth = require('./middleware/jwt-auth');

const userRouter = require('./routes/userRoutes');
const profileRouter = require('./routes/profileRoutes');
const authRouter = require('./routes/auth');

const app = express();

app.use(morgan('common'));

//Static webserver
app.use(express.static('public'));

//Parse request body
app.use(express.json());

//Public Routers
app.use('/api', authRouter);
app.use('/api/users', userRouter);

//Protected Routers
app.use('/api/profiles', jwtAuth, profileRouter);

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
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

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
