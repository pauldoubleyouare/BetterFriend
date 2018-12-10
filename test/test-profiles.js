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
chai.use(require('chai-like'));
chai.use(require('chai-things'));
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

  //=====Tests for GET to /profiles=====//
  describe('GET All Profiles endpoint', function() {
    it('Should GET Profiles that belong to the User requesting', function() {
      let ownerId = user.id;
      const dbPromise = Profile.find({ owner: ownerId });
      const apiPromise = chai
        .request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        res.status.should.equal(200);
        res.should.be.json;
        res.body.should.be.an('array');
        expect(res.body.length).to.equal(data.length);
      });
    });

    it('Should return a list of Profiles with the correct fields and values', function() {
      let ownerId = user.id;
      const dbPromise = Profile.find({ owner: ownerId });
      const apiPromise = chai
        .request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise]).then(([data, res]) => {
        res.status.should.equal(200);
        res.body.forEach(function(item, i) {
          item.should.be.an('object');
          item.should.include.keys(
            'owner',
            '_id',
            'firstName',
            'lastName',
            'email',
            'relationship',
            'birthday',
            'address',
            'phone',
            'createdAt',
            'updatedAt'
          );
          expect(item._id).to.equal(data[i]._id.toHexString());
          expect(item.owner).to.equal(data[i].owner.toHexString());
          expect(item.firstName).to.equal(data[i].firstName);
          expect(item.lastName).to.equal(data[i].lastName);
          expect(item.email).to.equal(data[i].email);
          expect(item.relationship).to.equal(data[i].relationship);
          expect(Date(item.birthday)).to.equal(Date(data[i].birthday));
          expect(item.phone).to.equal(data[i].phone);
        });
      });
    });
  });

  //=====Tests for GET to /profiles/:id=====//
  describe('GET /api/profiles/:id endpoint', function() {
    it('Should return one Profile via id', function() {
      let profileData;
      ownerId = user.id;
      return Profile.findOne({ owner: ownerId })
        .then(rawProfileData => {
          profileData = rawProfileData;
          return chai
            .request(app)
            .get(`/api/profiles/${profileData.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.should.include.keys(
            '_id',
            'owner',
            'firstName',
            'lastName',
            'email',
            'relationship',
            'address',
            'wishList',
            'birthday',
            'phone'
          );
          res.body._id.should.equal(profileData._id.toHexString());
          res.body.owner.should.equal(profileData.owner.toHexString());
        });
    });

    it('Should respond with a 400 for an invalid id', function() {
      const badId = 'TERRIBLE-ID';

      return chai
        .request(app)
        .get(`/api/profiles/${badId}`)
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          res.should.have.status(400);
          res.body.message.should.equal('The "id" is not valid');
        });
    });

    it('Should respond with a 404 for non-existent id', function() {
      return chai
        .request(app)
        .get('/api/profiles/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          res.should.have.status(404);
          res.body.message.should.equal('No profiles with that "id" found');
        });
    });
  });

  //=====Tests for POST to /profiles=====//
  describe('POST Profile endpoint', function() {
    it('Should create and return one new Profile when given valid data', function() {
      let newProfile = {
        owner: user.id,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        relationship: 'Friend',
        phone: '555-555-1212',
        birthday: faker.date.past(),
        address: {
          streetName: faker.address.streetName(),
          city: faker.address.city(),
          state: faker.address.state(),
          zipcode: faker.address.zipCode()
        },
        wishList: [
          { wishItem: faker.random.words() },
          { wishItem: faker.random.words() },
          { wishItem: faker.random.words() }
        ]
      };
      let body;

      return chai
        .request(app)
        .post(`/api/profiles`)
        .set('Authorization', `Bearer ${token}`)
        .send(newProfile)
        .then(function(res) {
          body = res.body;
          res.body.should.exist;
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.an('object');

          res.body.should.include.keys('owner', '_id', 'firstName', 'lastName');
          return Profile.findOne({ owner: user.id, _id: body._id });
        })
        .then(data => {
          body._id.should.equal(data._id.toHexString());
          body.owner.should.equal(data.owner.toHexString());
        });
    });

    it('Should return an error when missing a required field', function() {
      const badProfile = { something: 'not valid' };
      return chai
        .request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${token}`)
        .send(badProfile)
        .then(res => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.message.should.equal(
            'Missing firstName in request body' ||
              'Missing lastName in request body'
          );
        });
    });

    it('Should reject any non-string fields', function() {
      const nonStringTestFields = { firstName: 42, lastName: 'Rooster' };
      return chai
        .request(app)
        .post('/api/profiles')
        .set('Authorization', `Bearer ${token}`)
        .send(nonStringTestFields)
        .then(res => {
          res.should.have.status(422);
          res.should.be.json;
          res.body.message.should.equal(
            'Incorrect field type: expected string'
          );
        });
    });
  });

  //=====Tests for PUT to /profiles=====//
  describe('PUT Profile endpoint', function() {
    it('Should update one Profile', function() {
      let profileToUpdate = {
        firstName: 'Cosmo',
        lastName: 'Kramer',
        email: 'cosmo@kramer.com'
      };
      let ownerId = user.id;

      return Profile.findOne({ owner: ownerId })
        .then(function(profile) {
          profileToUpdate._id = profile._id;
          profileToUpdate.owner = profile.owner;
          return chai
            .request(app)
            .put(`/api/profiles/${profileToUpdate._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(profileToUpdate);
        })
        .then(function(res) {
          res.should.have.status(202);
          return Profile.findById(profileToUpdate._id);
        })
        .then(function(updatedProfile) {
          updatedProfile.id.should.equal(profileToUpdate._id.toHexString());
          updatedProfile.owner
            .toHexString()
            .should.equal(profileToUpdate.owner.toHexString());
        });
    });

    it('Should respond with a 400 if req.params.id is not a valid profileId', function() {
      let profileToUpdate = { firstName: 'Cosmo', lastName: 'Kramer' };

      return Profile.findOne({ owner: user.id })
        .then(function(profile) {
          profileToUpdate._id = profile._id;
          profileToUpdate.owner = profile.owner;
          return chai
            .request(app)
            .put(`/api/profiles/1`)
            .set('Authorization', `Bearer ${token}`)
            .send(profileToUpdate);
        })
        .then(res => {
          res.should.have.status(400);
          res.body.message.should.equal(
            `Request parameter id (1) should match request body id (${
              profileToUpdate._id
            }) and they both should exist`
          );
        });
    });

    it('Should respond with a 400 if the profile ID is not in the request body', function() {
      let profileToUpdate = { firstName: 'Cosmo', lastName: 'Kramer' };
      let profileId;

      return Profile.findOne({ owner: user.id })
        .then(function(profile) {
          profileToUpdate.owner = profile.owner;
          profileId = profile.id;
          return chai
            .request(app)
            .put(`/api/profiles/${profileId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(profileToUpdate);
        })
        .then(res => {
          res.should.have.status(400);
          res.body.message.should.equal(
            `Request parameter id (${profileId}) should match request body id (undefined) and they both should exist`
          );
        });
    });

    it('Should respond with a 400 if the profile ID in the body does not match the profile ID in the params', function() {
      let profileToUpdate = {
        firstName: 'Cosmo',
        lastName: 'Kramer',
        _id: 'DOESNOTEXIST'
      };
      let profileId;

      return Profile.findOne({ owner: user.id })
        .then(function(profile) {
          profileToUpdate.owner = profile.owner;
          profileId = profile.id;
          return chai
            .request(app)
            .put(`/api/profiles/${profileId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(profileToUpdate);
        })
        .then(res => {
          res.should.have.status(400);
          res.body.message.should.equal(
            `Request parameter id (${profileId}) should match request body id (DOESNOTEXIST) and they both should exist`
          );
        });
    });
  });

  //=====Tests for DELETE to /profiles=====//
  describe('DELETE Profile endpoint', function() {
    it('Should DELETE a Profile given the ID', function() {
      let data;
      return Profile.findOne({ owner: user.id })
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .delete(`/api/profiles/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(function(res) {
          res.should.have.status(204);

          res.body.should.be.empty;
          return Profile.findById(data._id);
        })
        .then(profile => {
          expect(profile).to.be.null;
        });
    });

    it('Should respond with a 204 when Profile id does not exist', function() {
      return chai
        .request(app)
        .delete('/api/profiles/DOESNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          res.should.have.status(204);
        });
    });
  });

  //=====Tests for POST to /profiles/:id/wishItem=====//
  describe('POST WishList endpoint', function() {
    it('Should create a new wishItem', function() {
      let newWish = { wishItem: 'cool wish' };
      let data;
      let profileId;
      return Profile.findOne({ owner: user.id })
        .then(_data => {
          data = _data;
          profileId = data._id;
          return chai
            .request(app)
            .post(`/api/profiles/${profileId}/wishItem`)
            .set(`Authorization`, `Bearer ${token}`)
            .send(newWish);
        })
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.profile.wishList.should.be.an('array');
          res.body.profile.wishList[0].should.include.keys('wishItem');
          return Profile.findOne({ owner: user.id, _id: profileId });
        })
        .then(function(data) {
          data.wishList.should.be
            .an('array')
            .that.contains.something.like(newWish);
        });
    });

    it('Should respond with a 400 if there is no wishItem in the request body', function() {
      let newWish = {};
      let data;
      let profileId;
      return Profile.findOne({ owner: user.id })
        .then(_data => {
          data = _data;
          profileId = data._id;
          return chai
            .request(app)
            .post(`/api/profiles/${profileId}/wishItem`)
            .set('Authorization', `Bearer ${token}`)
            .send(newWish);
        })
        .then(function(res) {
          res.should.have.status(400);
          res.body.message.should.equal('Missing wishItem in request body');
        });
    });

    it('Should respond with a 400 if the Profile ID is not a valid ObjectId', function() {
      let newWish = { wishItem: 'cool wish' };
      let data;
      return Profile.findOne({ owner: user.id })
        .then(_data => {
          data = _data;
          profileId = data._id;
          return chai
            .request(app)
            .post(`/api/profiles/1/wishItem`)
            .set('Authorization', `Bearer ${token}`)
            .send(newWish);
        })
        .then(function(res) {
          res.should.have.status(400);
          res.body.message.should.equal('Id is not valid');
        });
    });
  });

  //******Not sure how else to test if the wishList array has one less, or has been successfully deleted, other than status code?? */
  //=====Tests for DELETE to /profiles/:id/wishItem=====//
  describe('DELETE WishList endpoint', function() {
    it('Should delete a wishItem', function() {
      let data;
      let profileId;
      let wishToDelete;
      let wishId;
      return Profile.findOne({ owner: user.id })
        .then(_data => {
          data = _data;
          profileId = data._id;
          wishId = data.wishList[0]._id;
          wishToDelete = {_id: wishId}
          return chai
            .request(app)
            .delete(`/api/profiles/${profileId}/wishItem`)
            .set('Authorization', `Bearer ${token}`)
            .send(wishToDelete)
        })
        .then(function(res) {
          res.should.have.status(204);
          console.log('RESPONSE BODY>>>>>', res.body.profile);
          res.body.should.be.empty;
        });
    });
  });
});
