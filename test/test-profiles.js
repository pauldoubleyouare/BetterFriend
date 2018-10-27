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

//*****Do I need to do the same thing with routing as /api/users/USERID/profiles?

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
      fullName: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
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
  //******* Not sure how this wishItem/wishList things works with the model and schema, getting back [object], [object] */
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
    it('Should return all profiles associated with a User ID', function() {
      return chai
        .request(app)
        .get('/api/users/:id/profiles/')
        .then(function(res) {
          // console.log('RESPONSE>>>>>>..', res);
          res.status.should.equal(200);
          res.should.be.json;
          res.body.should.be.an('object');
          profileId = res.body.profiles[0].id;
          // console.log(profileId);

          // console.log('PROFILES ON GET /profiles>>>>>', JSON.stringify(res.body.profiles));
        });
    });

    it('Should return one Profile via id', function() {
      return chai
        .request(app)
        .get(`/api/users/:id/profiles/${profileId}`)
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('object');
          // console.log("response body>>>>>>>", res.body);
          // console.log('resbodyId>>>>', res.body.profiles.id)
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
    //Seed User data
    //create Profile under User
    //check to make sure that Profile has 'owner'
    before(function() {
      return seedUserData();
    });

    after(function() {
      return tearDownDb();
    });

    it('Should create one new Profile with User ID attached', function() {
      let newProfile = generateProfiles(1);
      // console.log('NEW PROFILE OWNER>>>>>>', newProfile);
      let ownerId = newProfile[0].owner;

      // console.log("NEW PROFILE>>>>>>", newProfile.fullName.firstName);
      return chai
        .request(app)
        .post(`/api/users/${ownerId}/profiles/`)
        .send(newProfile[0])
        .then(function(res) {
          // console.log("POST RESPONSE BODY>>>>", res.body);
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.an('object');
          res.body.should.exist;
          res.body.profile.should.include.keys('owner', 'id', 'fullName');
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
      //first we need a profile to update
      //
      seedProfileData();
      let profileToUpdate = {
        fullName: {
          firstName: 'Cosmo',
          lastName: 'Kramer'
        },
        email: 'cosmo@kramer.com'
      };

      return Profile.findOne()
        .then(function(profile) {
          console.log('PROFILE>>>>>', profile);
          profileToUpdate.id = profile.id;
          profileToUpdate.owner = profile.owner;
          console.log('PROFILE TO UPDATE>>>>>>>', profileToUpdate);
          return chai
            .request(app)
            .put(
              `/api/users/${profileToUpdate.owner}/profiles/${
                profileToUpdate.id
              }`
            )
            .send(profileToUpdate);
        })
        .then(function(res) {
          // console.log("RESPONSE BODY>>>>>", res.body);
          res.should.have.status(202);
          return Profile.findById(profileToUpdate.id);
        })
        .then(function(updatedProfile) {
          console.log('THE REAL DEAL>>>>>>>>>>>>', updatedProfile);
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
          console.log('PORIFLE IN DB>>>>>>>>', profile);
          let profileToDelete = profile;
          return chai
            .request(app)
            .delete(
              `/api/users/${profileToDelete.owner}/profiles/${
                profileToDelete.id
              }`
            );
        })
        .then(function(res) {
          console.log('PROFILE RESPONSE>>>>>>', res.body);
          res.should.have.status(200);
        });
    });
  });
});
