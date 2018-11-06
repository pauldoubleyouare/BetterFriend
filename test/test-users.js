const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;
const { User } = require('../models/userModel');
const { TEST_DATABASE_URL } = require('../config');
const faker = require('faker');
const mongoose = require('mongoose');

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

function seedUserData() {
  console.info('Seeding User data');
  const seedData = [];
  for (let i = 1; i <= 5; i++) {
    seedData.push({
      userName: faker.internet.userName(),
      fullName: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      email: faker.internet.email()
      // profiles: [{id: faker.random.uuid()}, {id: faker.random.uuid()}, {id: faker.random.uuid()}]
    });
  }
  return User.insertMany(seedData);
}

describe('Users API', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  describe('GET Users Endpoint', function() {
    before(function() {
      return seedUserData();
    });

    after(function() {
      return tearDownDb();
    });

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
          res.body.should.include.keys('id', 'userName', 'fullName', 'email');
        });
    });
  });

  describe('POST User endpoint', function() {
    after(function() {
      return tearDownDb();
    });

    it.only('Should create one new User', function() {
      const newUser = {
        userName: faker.internet.userName(),
        fullName: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName()
        },
        email: faker.internet.email(),
        password: faker.internet.password()
      };
      let responseId;
      return chai
        .request(app)
        .post('/api/users/')
        .send(newUser)
        .then(function(res) {
          responseId = res.body.id;
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.should.include.keys('id', 'userName', 'fullName', 'email');

          res.body.should.exist;
          return User.findById(responseId);
        })
        .then(function(user) {
          user.id.should.exist;
          user.userName.should.equal(newUser.userName);
          user.email.should.equal(newUser.email);
          user.fullName.should.deep.include(newUser.fullName);
        });
    });
  });

  describe('PUT User endpoint', function() {
    before(function() {
      return seedUserData();
    });

    after(function() {
      return tearDownDb();
    });

    it('Should update one user', function() {
      let userToUpdate = {
        userName: 'jseinfeld',
        fullName: {
          firstName: 'Jerry',
          lastName: 'Seinfeld'
        },
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
    before(function() {
      return seedUserData();
    });

    after(function() {
      return tearDownDb();
    });

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
