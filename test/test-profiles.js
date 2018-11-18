const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const { Profile } = require('../models/profileModel');
const { User } = require('../models/userModel');

const seedUsers = require('../db/Users');
const seedProfiles = require('../db/Profiles');

const faker = require('faker');
const mongoose = require('mongoose');

chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should();



function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection
      .dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}


describe('Profiles API', function() {
  let user;
  let token;
  let profileId;

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return Promise.all([
      User.insertMany(seedUsers),
      Profile.insertMany(seedProfiles)
    ]).then(([users]) => {
      user = users[0].serialize();
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.userName });
    });
  });

  after(function() {
    return closeServer();
  });

  afterEach(function() {
    return tearDownDb();
  });
  

  describe('GET Profiles endpoint', function() {
    it.only('Should GET Profiles that belong to the User requesting', function() {
      console.log("USER>>>>>", user);
      let ownerId = user.id;
      console.log('USER_ID>>>>', user.id);
      const dbPromise = Profile.find({ owner: ownerId });
      const apiPromise = chai
        .request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        res.status.should.equal(200);
        res.should.be.json;
        res.body.should.be.an('array');
        console.log('DATA>>>>>', data);
        console.log('RESPONSE BODY>>>>', res.body);
        expect(res.body.length).to.equal(data.length);
      });
    });

    it('Should return a list of Profiles with the correct fields and values', function() {
      let ownerId = user._id;
      const dbPromise = Profile.find({ ownerId });
      const apiPromise = chai.request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          res.status.should.equal(200);
          res.body.forEach(function(item, i) {
            item.should.be.an('object');
            console.log('ITEM>>>>', item);
            console.log('DATA>>>>', data)
            item.should.have.all.keys('owner', 'id', 'firstName', 'lastName', 'email', 'relationship', 'birthday', 'address', 'phone', 'wishList');
            expect(item.id).to.equal(data[i]._id);
            expect(item.owner).to.equal(data[i].owner);
            expect(item.firstName).to.equal(data[i].firstName);
            expect(item.lastName).to.equal(data[i].lastName);
            expect(item.email).to.equal(data[i].email);
            expect(item.relationship).to.equal(data[i].relationship);
            expect(item.birthday).to.equal(data[i].birthday);
            expect(item.phone).to.equal(data[i].phone);
            expect(item.wishList).to.equal(data[i].wishList);
          });
        });
    });

    it('Should return one Profile via id', function() {
      return chai
        .request(app)
        .get(`/api/profiles/${profileId}`)
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.profile._id.should.equal(profileId);
          res.body.profile.should.include.keys(
            '_id',
            'owner',
            'firstName',
            'lastName',
            'email',
            'relationship'
          );
        });
    });
  });

  describe('POST Profile endpoint', function() {
    before(function() {
      return seedUserData();
    });

    after(function() {
      return tearDownDb();
    });

    it('Should create one new Profile with User ID attached', function() {
      let newProfile = generateProfiles(1);
      let ownerId = newProfile[0].owner;

      return chai
        .request(app)
        .post(`/api/profiles/`)
        .send(newProfile[0])
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.should.exist;
          res.body.profile.should.include.keys(
            'owner',
            'id',
            'firstName',
            'lastName'
          );
        });
    });
  });

  describe('PUT Profile endpoint', function() {
    before(function() {
      return seedUserData(), seedProfileData();
    });

    after(function() {
      return tearDownDb();
    });

    it('Should update one Profile', function() {
      seedProfileData();
      let profileToUpdate = {
        firstName: 'Cosmo',
        lastName: 'Kramer',
        email: 'cosmo@kramer.com'
      };

      return Profile.findOne()
        .then(function(profile) {
          profileToUpdate.id = profile.id;
          profileToUpdate.owner = profile.owner;
          return chai
            .request(app)
            .put(`/api//profiles/${profileToUpdate.id}`)
            .send(profileToUpdate);
        })
        .then(function(res) {
          res.should.have.status(202);
          return Profile.findById(profileToUpdate.id);
        })
        .then(function(updatedProfile) {
          updatedProfile.id.should.equal(profileToUpdate.id);
          updatedProfile.owner.should.deep.equal(profileToUpdate.owner);
        });
    });
  });

  describe('DELETE Profile endpoint', function() {
    before(function() {
      return seedUserData(), seedProfileData();
    });

    after(function() {
      return tearDownDb();
    });

    it('Should DELETE a Profile given the ID', function() {
      return Profile.findOne()
        .then(function(profile) {
          let profileToDelete = profile;
          return chai
            .request(app)
            .delete(`/api/profiles/${profileToDelete.id}`);
        })
        .then(function(res) {
          res.should.have.status(200);
        });
    });
  });
});
