const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;
const { Profile } = require('../models/profileModel');
const { User } = require('../models/userModel');
const { TEST_DATABASE_URL } = require('../config');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();

chai.use(chaiHttp);

function seedUserData() {
  console.info('Seeding User data');
  const seedData = [];
  for (let i = 1; i <= 5; i++) {
    seedData.push({
      userName: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email()
      // profiles: [{id: faker.random.uuid()}, {id: faker.random.uuid()}, {id: faker.random.uuid()}]
    });
  }
  return User.insertMany(seedData)
    .then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.userName });
    });
}

function generateProfiles(numberOfProfiles) {
  function generateRelationship() {
    const relationship = [
      'Mom',
      'Dad',
      'Friend',
      'Brother',
      'Sister',
      'Boyfriend',
      'Girlfriend',
      'Aunt',
      'Uncle'
    ];
    return relationship[Math.floor(Math.random() * relationship.length)];
  }
  const profilesData = [];
  for (let i = 1; i <= numberOfProfiles; i++) {
    profilesData.push({
      owner: mongoose.Types.ObjectId(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      relationship: generateRelationship(),
      wishList: [
        {
          wishItem: faker.random.words()
        },
        {
          wishItem: faker.random.words()
        }
      ]
    });
  }
  return profilesData;
}

function seedProfileData() {
  console.info('Seeding Profile data');
  return Profile.insertMany(generateProfiles(6));
}

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

  after(function() {
    return closeServer();
  });

  describe('GET Profile endpoint', function() {
    before(function() {
      return seedProfileData();
    });

    after(function() {
      return tearDownDb();
    });

    let profileId;
    it('Should GET Profiles that belong to the User requesting', function() {
      const dbPromise = Profile.find({owner});
      const apiPromise = chai.request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${token}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          res.status.should.equal(200);
          res.should.be.json;
          res.body.should.be.an('object');
          profileId = res.body.profiles[0].id;
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
            'fullName',
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
            .put(
              `/api//profiles/${
                profileToUpdate.id
              }`
            )
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
            .delete(
              `/api/profiles/${
                profileToDelete.id
              }`
            );
        })
        .then(function(res) {
          res.should.have.status(200);
        });
    });
  });
});
