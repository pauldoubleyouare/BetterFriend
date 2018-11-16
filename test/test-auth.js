'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require ('../server');
const { User } = require('../models/userModel');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;
const should = chai.should;

chai.use(chaiHttp);

describe('BetterFriend - Login', function() {
  let user;
  const userName = 'testUser';
  const password = 'testPassword';
  const firstName = 'Test';
  const lastName = 'User';
  const email = 'test@email.com';

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(digest => 
      User.create({
        userName,
        password: digest,
        firstName,
        lastName,
        email
      }))
      .then(_user => {
        user = _user;
      });
  });

  afterEach(function() {
    return User.remove({});
  });

  describe('BetterFriend /api/login', function() {

    it('Should return a 400 Error "No credential provided" when no credentials are sent', function() {
      return chai.request(app)
        .post('/api/login')
        .send({})
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('No credentials provided');
          console.log("RESPONSE BODY>>>>>", res.body);
        });
    });

    it("Should return a 401 Error 'Invalid credentials' at 'userName' when sent an invalid 'userName'", function() {
      return chai.request(app)
        .post('/api/login')
        .send({ userName: "wrongUsername", password })
        .then(res => {
          expect(res).to.have.status(401);
          res.body.message.should.equal('Invalid credentials');
          res.body.location.should.equal('userName');
        });
    });

    it('Should return 401 error "Invalid credentials" at "password" when sent an invalid password', function() {
      return chai.request(app)
        .post('/api/login')
        .send({userName, password: "wrongPassword" })
        .then(res => {
          expect(res).to.have.status(401);
          res.body.message.should.equal('Invalid credentials');
          res.body.location.should.equal('password');
        });
    });

    context('When sent a valid userName and password', function() {

      it('Should return 200 OK with a valid JWT in "authToken"', function() {
        return chai.request(app)
          .post('/api/login')
          .send({userName, password})
          .then(res => {
            expect(res).to.have.status(200);
            res.body.should.be.an('object');
            res.body.authToken.should.be.a('string');
            jwt.verify(res.body.authToken, JWT_SECRET);
          });
      });

      it('Should return a valid JWT with correct "id", "userName", "firstName", "lastName", and "email"', function() {
        return chai.request(app)
          .post('/api/login')
          .send({ userName, password })
          .then(res => {
            const payload = jwt.verify(res.body.authToken, JWT_SECRET);
            expect(payload.user.id).to.equal(user.id);
            expect(payload.user.userName).to.equal(userName);
            expect(payload.user.firstName).to.equal(firstName);
            expect(payload.user.lastName).to.equal(lastName);
            expect(payload.user.email).to.equal(email);
          });
      });

      it('Should return a JWT that does NOT contain a password', function() {
        return chai.request(app)
          .post('/api/login')
          .send({ userName, password })
          .then(res => {
            const payload = jwt.verify(res.body.authToken, JWT_SECRET);
            expect(payload.user).to.not.have.property('password');
          });
      });
    });  
  });

  describe('POST /api/refresh', function() {
    it.only('Should reject requests when no "Authorization" header is sent', function() {
      return chai.request(app)
        .post('/api/refresh')
        .then(res => {
          expect(res).to.have.status(401);
          res.body.message.should.equal('No "Authorization" header found');
        });
    });



  });


});