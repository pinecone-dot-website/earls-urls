var app = require('../index');
var chai = require('chai');
var faker = require('faker');
//var request = require('supertest');
var expect = chai.expect;

chai.use(require('chai-http'));

describe('Empty Post to API', function() {
    it('should return 400 on empty api request', function(done) {
        chai.request(app)
            .post('/api')
            .end(function(err, res) {
                expect(res.statusCode).to.equal(400);
                expect(res.body.success).to.equal(false);
                expect(res.body.message.length).to.be.above(0);
                done();
            });
    });
});

describe('Post URL to API', function() {
    it('should return 200 on correct api request', function(done) {
        var url = faker.internet.url();

        chai.request(app)
            .post('/api')
            .send({ url: url })
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                expect(res.body.success).to.equal(true);
                expect(res.body.input_url).to.equal(url);
                done();
            });
    });
});