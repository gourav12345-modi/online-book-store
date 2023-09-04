const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('User Routes', () => {
  // Test user registration
  describe('/POST /api/users/register', () => {
    it('should register a new user', (done) => {
      chai
        .request(app)
        .post('/api/users/register')
        .send({ username: 'testuser', password: 'testpassword' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message').equal('User registered successfully');
          done();
        });
    });
  });

  // Test user login
  describe('/POST /api/users/login', () => {
    it('should log in a user and return a JWT token', (done) => {
      chai
        .request(app)
        .post('/api/users/login')
        .send({ username: 'testuser', password: 'testpassword' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token').that.is.a('string');
          done();
        });
    });
  });

  // Test user logout
  describe('/POST /api/users/logout', () => {
    it('should log out a user', (done) => {
      chai
        .request(app)
        .post('/api/users/logout')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').equal('User logged out');
          done();
        });
    });
  });
});
