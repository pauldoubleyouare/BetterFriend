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

    beforeEach(function() {
        return seedUserData();
    });

    afterEach(function() {
        return tearDownDb();
    });

    after(function() {
        return closeServer();
    });

    describe('GET Users Endpoint', function() {
        it('Should return all User documents on GET request', function() {
            return chai.request(app)
                .get('/api/users/')
                .then(function(res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    // console.log("response:", res)
                    //what are the points of failure? what would break?
                });
        });
    })

    //******* Should I create a new db in Mongo for testing? not sure how that works?
    
    

    // describe('GET User by Id Endpoint', function() {
    //     it('Should return one User by Id', function() {
    //         return chai.request(app)
    //             .get('/api/users/:id')
    //             .then(function(res) {
    //                 res.should.have.status(200);
    //                 res.should.be.json;
    //                 res.body.should.be.a('object');
    //                 //response should only contain 1 object
    //                 //response should have 
    //                 //req.params.id should match the oid inside of DB
    //             })
    //     })
    // });

    // describe('POST Endpoint', function () {
    //     it('Should create a new User upon request', function() {
        //confirming fields, what request type

    //     })


    // });
       
});
