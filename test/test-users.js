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



//for our tests, we're dropping the db so data isn't there for our next test
function tearDownDb() {
    return new Promise((resolve, reject) => {
        console.warn('Deleting database');
        mongoose.connection.dropDatabase()
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
            // console.log('>>>>>>>Get users')
            return chai.request(app)
                .get('/api/users/')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.an('object');
                    // console.group("GET all Response Body>>>>>>>>", res.body)
                    userId = res.body.users[0].id;
                    //what are the points of failure? what would break?
                });
        });

        it('Should return one User by Id', function() {
            // console.log(">>>>>>>>> get user");
            return chai.request(app)
                .get(`/api/users/${userId}`)
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    //response should only contain 1 object
                    res.body.should.be.an('object');
                    console.group("GET one >>>>RESPONSE", res.body);
                    //req.params.id should match the oid inside of DB
                    res.body.id.should.equal(userId);
                    //confirm it has all the fields we care about
                    res.body.should.include.keys('id', 'userName', 'fullName', 'email');
                    //confirm password isn't sent over
                    
                });
        });
    });

    describe('POST User endpoint', function() {
        // Strategy:
        //      1. Tearing down the DB after we create a new User
        //      2. We're creating a new user to save into the DB
        //      3. We're making sure that User that we're creating and returning has the correct fields to a known state
        // ***** Why not save the user to the DB 

        after(function(){
            return tearDownDb();
        });

        it('Should create one new User', function() {
            const newUser = {
                userName: faker.internet.userName(),
                fullName: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName()
                },
                email: faker.internet.email()
            };
            let responseId;
            return chai.request(app)
                .post('/api/users/')
                .send(newUser)
                .then(function(res) {
                    //***** Not sure the concept behind this? */
                    responseId = res.body.id;
                    res.should.have.status(201);
                    res.should.be.json;
                    res.body.should.be.an('object');
                    // console.log(">>>>>>>>>>RESPONSE", res.body);
                    // res.body should have the correct fields as newUser
                    res.body.should.include.keys('id', 'userName', 'fullName', 'email');
                    // res.body.id should exist
                    res.body.should.exist;
                    // what you send is what you should get back 
                    // res.body.id.should.equal(newUser.id);

                    //return the user to push into the next .then()
                    return User.findById(responseId);
                    //
                    
                })
                .then(function(user) {
                    // console.log("USER>>>>>>", user);
                    // console.log(responseId);
                    // user.id.should.equal(res.body.id);
                    user.id.should.exist;
                    user.userName.should.equal(newUser.userName);
                    user.email.should.equal(newUser.email);
                    // console.log(user.fullName);
                    // console.log(newUser.fullName);
                    user.fullName.should.deep.include(newUser.fullName);
                    //check for correct User fields inside of the document in the DB?
                    // res.body.id should be the same as newUser.id
                })
        });
    });

    describe('PUT User endpoint', function() {
        
        before(function() {
            return seedUserData();
        })
        
        after(function() {
            return tearDownDb();
        });
        //We need to first have an existing User in the DB that we can retrieve by ID
        //Need to make a put on that User with the updatedUser
        //Check the DB for that user and make sure the fields are correct 
        //**** It feels like we're doing double work, because the user we're creating in the test is just a forced copy? */

        it('Should update one user', function() {
            let userToUpdate = {
                userName: "jseinfeld",
                fullName: {
                    firstName: "Jerry",
                    lastName: "Seinfeld"
                },
                email: "jerry@seinfeld.com"
            };

            return User
                .findOne()
                .then(function(user) {
                    // console.log("SOME USER>>>>>>>>", user.id);
                    userToUpdate.id = user.id;
                    // console.log("UPDATED USER>>>>>", updatedUser);
                    return chai.request(app)
                        .put(`/api/users/${userToUpdate.id}`)
                        .send(userToUpdate)
                })
                .then(function(res) {
                    // console.log(res.status);
                    res.should.have.status(204);
                    // console.log("RESPONSE BODY>>>>>>", res.body);
                    return User
                        .findById(userToUpdate.id);
                })
                .then(function(updatedUser) {
                    // console.log('UPDATED USER>>>>>>', updatedUser);
                    updatedUser.id.should.equal(userToUpdate.id);
                    updatedUser.userName.should.equal(userToUpdate.userName);
                })
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

            it('Should delete one user from the database', function(){
                return User
                    .findOne()
                    .then(function(user) {
                        // console.log('USER in DB >>>>>>>>', user);
                        userToDelete = user;
                        // console.log('USERtoDELETE>>>>>>', userToDelete);
                        return chai.request(app)
                        .delete(`/api/users/${userToDelete.id}`)
                    })
                    .then(function(res) {
                        // console.log('RES STATUS>>>>', res.status);
                        res.should.have.status(200);
                        return User.findById(userToDelete.id);
                    })
                    .then(function(nouser){
                        // console.log("NULL????>>>>>>>", nouser);
                        expect(nouser).to.be.null;
                    })
            })

        })


});
    //Next steps:
// finish tests for PUT POST DELETE then Profiles
    


