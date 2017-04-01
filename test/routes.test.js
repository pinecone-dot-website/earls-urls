var app = require('../index');
var chai = require('chai');
var request = require('supertest');

var expect = chai.expect;

describe('API Tests', function() {
    it('should return 200 on home page', function(done) {
        request(app)
            .get('/')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                done();
            });
    });
});