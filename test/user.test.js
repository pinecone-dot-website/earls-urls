var app = require('../index');
var chai = require('chai');
var faker = require('faker');
//var request = require('supertest');
var expect = chai.expect;

chai.use(require('chai-http'));

var username = faker.name.findName();
var password = faker.internet.password();

describe('User registration empty post', function() {
    it('should redirect to error on blank user registration', function(done) {
        chai.request(app)
            .post('/u/auth')
            .send({ register: 1 })
            .end(function(err, res) {
                expect('Location', '/?register-error')
                done();
            });
    });
});

describe('User registration correct', function() {
    it('should redirect to success on user registration', function(done) {
        chai.request(app)
            .post('/u/auth')
            .send({ username: username, password: password, register: 1 })
            .end(function(err, res) {
                expect('Location', '/?register-success')
                done();
            });
    });
});