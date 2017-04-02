var app = require('../index');
var chai = require('chai');
var request = require('supertest');

var expect = chai.expect;

describe('Get Home Page', function() {
    it('should return 200 on home page', function(done) {
        request(app)
            .get('/')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });
});

describe('Empty Post to API', function() {
    it('should return 400 on empty api request', function(done) {
        request(app)
            .post('/api')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body.success).to.equal(false);
                expect(res.body.message.length).to.be.above(0);
                done();
            });
    });
});