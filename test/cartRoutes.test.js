const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose');
const app = require('../app');

const expect = chai.expect;
const Cart = require('../models/Cart');
const User = require('../models/User');
const Book = require('../models/Book')

chai.use(chaiHttp);

describe('Cart', () => {
  let con, mongoServer, token, newBook, newUser, newCart;

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


  // Create book and cart before each testcase
  beforeEach(async () => {
    // create a book
    const sampleBook = {
      title: 'Sample Book',
      author: 'John Doe',
      genre: 'Action',
      price: 19.99,
      availability: 20,
    };

    newBook = new Book(sampleBook)
    await newBook.save()

    // Create a cart item
    const cartItem = {
      book: newBook._id,
      quantity: 2,
    };

    // Create a cart
    newCart = new Cart({
      user: newUser._id,
      items: [cartItem],
    });

    await newCart.save()
  });

  // Clear the cart data after running each the tests
  afterEach(async () => {
    await Book.deleteMany({});
    await Cart.deleteMany({});
  });

  // Test POST /api/cart/add route
  describe('POST /api/cart/add', (done) => {
    it('should add a book to the cart', async () => {

      // first make cart collection empty
      await Cart.deleteMany({})

      const cartItem = {
        bookId: newBook._id,
        quantity: 3,
      };

      const res = await chai
        .request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message').equal('Book added to cart successfully.');
    });

    it('should return a 404 error when trying to add a non-existing book to the cart', async () => {
      // delete all book first
      await Book.deleteMany({})

      const nonExistingBookId = newBook._id;

      const cartItem = {
        bookId: nonExistingBookId,
        quantity: 1,
      };

      const res = await chai
        .request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
      expect(res).to.have.status(404);
      expect(res.body).to.have.property('message').equal('Book not found.');
    });

    it('should return a 400 error when trying to add more books to the cart than available', (done) => {
      const cartItem = {
        bookId: newBook._id,
        quantity: newBook.availability + 1,
      };

      chai
        .request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${token}`)
        .send(cartItem)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message').equal('Requested quantity exceeds availability.');
          done();
        });
    });
  })


  // Test DELETE /api/cart/remove/:bookId route
  describe('DELETE /api/cart/remove/:bookId', () => {
    it('should remove a book from the cart', (done) => {
      chai
        .request(app)
        .delete(`/api/cart/remove/${newBook._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 2 })
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });

    it('should return 400 if requested quantity to remove exceeds cart quantity', (done) => {
      chai
        .request(app)
        .delete(`/api/cart/remove/${newBook._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 10 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message').equal('Requested quantity to remove exceeds cart quantity.');
          done();
        });
    });

    it('should return a 404 error when trying to remove a non-existing book from the cart', async () => {
      newCart.items = []
      await newCart.save()
      const nonExistingBookId = newBook._id;

      const res = await chai
        .request(app)
        .delete(`/api/cart/remove/${nonExistingBookId}`)
        .set('Authorization', `Bearer ${token}`)
      expect(res).to.have.status(404);

    });
  })


  // Test GET /api/cart route
  it('should get the user\'s cart on GET /api/cart', (done) => {
    chai
      .request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('cart').that.is.an('array').lengthOf(1);
        expect(res.body).to.have.property('totalPrice').equals(39.98)
        
        const { book, quantity } = res.body.cart[0];
        expect(quantity).to.equal(2)
        expect(book.title).to.equal(newBook.title)
        expect(book.author).to.equal(newBook.author)
        expect(book.price).to.equal(newBook.price)
        expect(book.genre).to.equal(newBook.genre)
        done();
      });
  });
});
