'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);

//initial test to check if the home page is being displayed
describe('Home page', function() {
  it('should display the home page', function() {
    return chai
      .request(app)
      .get('/')
      .then(function(res) {
        expect(res).to.have.status(200);
        // console.log(res);
      });
  });
});
