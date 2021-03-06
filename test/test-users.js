const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;
const { User } = require('../models/userModel');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');
const faker = require('faker');
const mongoose = require('mongoose');
const seedUsers = require('../db/Users');
const jwt = require('jsonwebtoken');

const should = chai.should();

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection
      .dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Users API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(seedUsers),
    ]).then(([users]) => {
      user = users[0].serialize();
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.userName });
    });
  });

  afterEach(function() {
    return tearDownDb();
  });


  describe('GET Users Endpoint', function() {



    let userId;
    it('Should return all User documents on GET request', function() {
      return chai
        .request(app)
        .get('/api/users/')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('object');
          userId = res.body.users[0].id;
        });
    });

    it('Should return one User by Id', function() {
      return chai
        .request(app)
        .get(`/api/users/${userId}`)
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.id.should.equal(userId);
          res.body.should.include.keys('id', 'userName', 'firstName', 'lastName', 'email');
        });
    });
  });

  describe('POST User endpoint', function() {
    after(function() {
      return tearDownDb();
    });
    const userName = 'userName';
    const password = 'password';
    const firstName = 'firstName';
    const lastName = 'lastName';
    const email = 'cool@email.com';

    it('Should create one new User', function() {
      let responseId;
      return chai
        .request(app)
        .post('/api/users/')
        .send({ userName, password, firstName, lastName, email })
        .then(function(res) {
          responseId = res.body.id;
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.should.include.keys(
            'id',
            'userName',
            'firstName',
            'lastName',
            'email'
          );

          res.body.should.exist;
          return User.findById(responseId);
        })
        .then(function(user) {
          user.id.should.exist;
          user.userName.should.equal(userName);
          user.email.should.equal(email);
          user.firstName.should.equal(firstName);
          user.lastName.should.equal(lastName);
        });
    });

    it('Should reject users with missing userName', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({ password, firstName, lastName, email })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal('Missing userName in request body');
        });
    });

    it('Should reject users with missing password', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({ userName, firstName, lastName, email })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal('Missing password in request body');
        });
    });

    it('Should reject users with non-string password', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({ userName, password: 1234, firstName, lastName, email })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal('Incorect field type: expected string');
        });
    });

    it('Should reject users with non-trimmed userName', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          userName: ` ${userName} `,
          password,
          firstName,
          lastName,
          email
        })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal(
            'userName cannot start or end with a blank space'
          );
        });
    });

    it('Should reject users with non-trimmed password', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          userName,
          password: ` ${password} `,
          firstName,
          lastName,
          email
        })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal(
            'password cannot start or end with a blank space'
          );
        });
    });

    it('Should reject users with userName less than 3 characters', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({ userName: 'aa', password, firstName, lastName, email })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal(
            'userName must be at least 3 characters long'
          );
        });
    });

    it('Should reject users with userName greater than 20 characters', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          userName: new Array(21).fill('a').join(''),
          password,
          firstName,
          lastName,
          email
        })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal(
            'userName must be at most 20 characters long'
          );
        });
    });

    it('Should reject users with passwords less than 8 characters', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({ userName, password: 'aaaaaaa', firstName, lastName, email })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal(
            'password must be at least 8 characters long'
          );
        });
    });

    it('Should reject users with password greater than 72 characters', function() {
      return chai
        .request(app)
        .post('/api/users')
        .send({
          userName,
          password: new Array(73).fill('x').join(''),
          firstName,
          lastName,
          email
        })
        .then(res => {
          res.should.have.status(422);
          res.body.message.should.equal(
            'password must be at most 72 characters long'
          );
        });
    });

    it('Should reject users with a duplicate userName', function() {
      return User.create({
        userName,
        password,
        firstName,
        lastName,
        email
      })
        .then(() => 
          chai.request(app).post('/api/users').send({
            userName,
            password,
            firstName,
            lastName,
            email
          })
        )
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body.message).to.equal('Username already taken');
        });
    });
  });


  describe('PUT User endpoint', function() {

    it('Should update one user', function() {
      let userToUpdate = {
        userName: 'jseinfeld',
        firstName: 'Jerry',
        lastName: 'Seinfeld',
        email: 'jerry@seinfeld.com'
      };

      return User.findOne()
        .then(function(user) {
          userToUpdate.id = user.id;
          return chai
            .request(app)
            .put(`/api/users/${userToUpdate.id}`)
            .send(userToUpdate);
        })
        .then(function(res) {
          res.should.have.status(204);
          return User.findById(userToUpdate.id);
        })
        .then(function(updatedUser) {
          updatedUser.id.should.equal(userToUpdate.id);
          updatedUser.userName.should.equal(userToUpdate.userName);
        });
    });
  });

  describe('DELETE User endpoint', function() {

    let userToDelete;

    it('Should delete one user from the database', function() {
      return User.findOne()
        .then(function(user) {
          userToDelete = user;
          return chai.request(app).delete(`/api/users/${userToDelete.id}`);
        })
        .then(function(res) {
          res.should.have.status(200);
          return User.findById(userToDelete.id);
        })
        .then(function(nouser) {
          expect(nouser).to.be.null;
        });
    });
  });
});
