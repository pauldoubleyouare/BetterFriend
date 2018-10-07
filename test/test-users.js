const chai = require('chai');
const mocha = require('mocha');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;
const { User } = require('../models/userModel');
const { TEST_DATABASE_URL } = require('../config');


chai.use(chaiHttp);

describe('User', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should list all users on GET request', function() {
        return chai.request(app)
            .get('/api/users/')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a.apply('array');
                expect(res.body.length).to.be.above(0);
                res.body.forEach(function(item) {
                    expect(item).to.be.a('object');
                    expect(item).to.have.all.keys(
                        'id', 'userName', 'firstName', 'email'
                    );
                });
            });
    });
});
