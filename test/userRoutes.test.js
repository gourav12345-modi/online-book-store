const chai = require('chai');
const chaiHttp = require('chai-http');
const connectDB = require('../config/db');
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose');

const app = require('../app');

const expect = chai.expect;

chai.use(chaiHttp);

describe('User Routes', () => {
  var con, mongoServer

  // Connect to the test database before running tests
  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    con = await mongoose.connect(mongoServer.getUri(), {})
  });

  // Close the test database connection after running tests
  after(async () => {
    if (con) {
      con.disconnect()
    }
    if (mongoServer) {
      await mongoServer.stop()
    }
  });

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

    it('should fail to register a duplicate user', (done) => {
      chai
        .request(app)
        .post('/api/users/register')
        .send({ username: 'testuser', password: 'testpassword' }) // Same username as previous test
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message').equal('User already exists');
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

    it('should fail to log in with incorrect password', (done) => {
      chai
        .request(app)
        .post('/api/users/login')
        .send({ username: 'testuser', password: 'wrongpassword' }) // Incorrect password
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').equal('Invalid credentials');
          done();
        });
    });

    it('should fail to log in with non-existent username', (done) => {
      chai
        .request(app)
        .post('/api/users/login')
        .send({ username: 'nonexistentuser', password: 'testpassword' }) // Non-existent username
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').equal('Invalid credentials');
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
