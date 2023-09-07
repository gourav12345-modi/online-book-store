const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;
const User = require('../models/User');
const Book = require('../models/Book')
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose');

chai.use(chaiHttp);

describe('Books', () => {
  let con, mongoServer, token, newBook, newUser;

  // Connect to the test database before running tests
  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    con = await mongoose.connect(mongoServer.getUri(), {})
    newUser = new User({
      username: 'user1',
      password: 'password1234',
    });

    await newUser.save();

    token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
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

  beforeEach(async () => {
    const sampleBook = {
      title: 'Sample Book',
      author: 'John Doe',
      genre: 'Action',
      price: 19.99,
      availability: 20,
    };

    newBook = new Book(sampleBook)
    await newBook.save()
  });

  // After each test, remove the sample book
  afterEach(async () => {
    await Book.deleteMany({})
  });

  // function to check if two book objects are equal
  function assertBookEquality(actualBook, expectedBook) {
    expect(actualBook.title).to.equal(expectedBook.title)
    expect(actualBook.author).to.equal(expectedBook.author)
    expect(actualBook.price).to.equal(expectedBook.price)
    expect(actualBook.genre).to.equal(expectedBook.genre)
    expect(actualBook.availability).to.equal(expectedBook.availability)
  }

  // Test GET /api/books route
  describe('GET /api/books', () => {
    it('should list all books.', (done) => {
      chai
        .request(app)
        .get('/api/books')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array').have.lengthOf(1);
          const responseBook = res.body[0];
          assertBookEquality(responseBook, newBook);
          done();
        });
    });

    it('should return empty array for page no. that does not exist', (done) => {
      chai
        .request(app)
        .get('/api/books?page=5')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array').that.is.empty;
          done()
        })
    })
  })

  // Test GET /api/books/:id route
  describe('GET /api/books/:id', () => {
    it('should get a single book', (done) => {
      chai
        .request(app)
        .get(`/api/books/${newBook._id}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          assertBookEquality(res.body, newBook)
          done();
        });
    });

    it('should return 404 if book with given id doesn\'t exist', async () => {
      await Book.deleteMany({})
      const res = await chai
        .request(app)
        .get(`/api/books/${newBook._id}`)

      expect(res).to.have.status(404);
      expect(res.body).to.have.property('message').equal('Book not found.');
    });
  })

  // Test POST /api/books route
  it('should create a new book on /api/books POST', (done) => {
    const sampleBook = {
      title: 'Sample Book1',
      author: 'John Cara',
      genre: 'Adventure',
      price: 15,
      availability: 35,
    };

    chai
      .request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleBook)
      .end((err, res) => {
        expect(res).to.have.status(201);
        assertBookEquality(res.body, sampleBook)
        done()
      });
  });

  // Test PUT /api/books/:id route
  describe('PUT /api/books/:id', () => {
    it('should update a book', (done) => {
      const updatedBook = {
        title: 'Updated Book Title',
        author: 'Updated Author',
        genre: 'updated genre',
        price: 29.99,
        availability: 30,
      };

      chai
        .request(app)
        .put(`/api/books/${newBook._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedBook)
        .end((err, res) => {
          expect(res).to.have.status(200);
          assertBookEquality(res.body, updatedBook)
          done();
        });
    });

    it('should return 404 if book with given id doesn\'t exist', async () => {
      await Book.deleteMany({})
      const res = await chai
        .request(app)
        .get(`/api/books/${newBook._id}`)
      expect(res).to.have.status(404);
      expect(res.body).to.have.property('message').equal('Book not found.');
    })
  })

  // Test DELETE /api/books/:id route
  it('should delete a book on /api/books/:id DELETE', (done) => {
    chai
      .request(app)
      .delete(`/api/books/${newBook._id}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
  });

  describe('GET /api/books/search', () => {
    it('should get all books with given title', (done) => {
      chai
        .request(app)
        .get(`/api/books/search?query=${newBook.title}`)
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('array').lengthOf(1)
          assertBookEquality(res.body[0], newBook)
          done()
        })
    })
  
    it('should get all books with given author', (done) => {
      chai
        .request(app)
        .get(`/api/books/search?query=${newBook.author}`)
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('array').lengthOf(1)
          assertBookEquality(res.body[0], newBook)
          done()
        })
    })
  
  })
 
  // Test POST /api/books/:id/rate-review route
  it('should rate and review a book on /api/books/:id/rate-review POST', (done) => {
    const ratingReviewData = {
      rating: 4,
      text: 'Great book!',
    };

    chai
      .request(app)
      .post(`/api/books/${newBook._id}/rate-review`)
      .set('Authorization', `Bearer ${token}`)
      .send(ratingReviewData)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message').equal('Rating and review added successfully.');
        done();
      });
  });

  // Test GET /api/books/:id/rate-review route
  it('should get rate and review a book on /api/books/:id/rate-review POST', async () => {
    const ratingReviewData = {
      rating: 4,
      text: 'Great book!',
    };

    newBook.ratings.push({ userId: newUser._id, rating: ratingReviewData.rating })
    newBook.reviews.push({ userId: newUser._id, text: ratingReviewData.text })
    await newBook.save()

    const res = await chai
      .request(app)
      .get(`/api/books/${newBook._id}/rate-review`)

    expect(res).to.have.status(200);
    expect(res.body).to.be.a('object')
    const { ratings, reviews } = res.body
    expect(ratings).to.be.a('array').lengthOf(1)
    const responseRating = ratings[0];
    expect(responseRating).to.have.property('userId').equal(newUser._id.toString())
    expect(responseRating).to.have.property('rating').equal(ratingReviewData.rating)

    const responseReview = reviews[0];
    expect(responseReview).to.have.property('userId').equal(newUser._id.toString())
    expect(responseReview).to.have.property('text').equal(ratingReviewData.text)
  })
});
