var app = require('../index');
var chai = require('chai');
var faker = require('faker');
//var request = require('supertest');
var expect = chai.expect;

chai.use(require('chai-http'));

describe('Get Home Page', function() {
    it('should return 200 on home page', function(done) {
        chai.request(app)
            .get('/')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });
});