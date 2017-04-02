var app = require('../index');
var chai = require('chai');
var faker = require('faker');
var expect = chai.expect;

chai.use(require('chai-http'));

var input_url = faker.internet.url();
var short_url = "";

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
    it('should return success on correct api request', function(done) {
        chai.request(app)
            .post('/api')
            .send({ url: input_url })
            .end(function(err, res) {
                expect(res.statusCode).to.equal(200);
                expect(res.body.success).to.equal(true);
                expect(res.body.input_url).to.equal(input_url);
                done();
            });
    });
});