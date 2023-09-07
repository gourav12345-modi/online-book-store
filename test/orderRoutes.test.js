const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const app = require('../app');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const User = require('../models/User');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Order Routes', () => {
  let con, mongoServer, token, newBook, newUser, newCart;

   // Connect to the test database before running tests
   before(async () => {
    mongoServer = await MongoMemoryServer.create()
    con = await mongoose.connect(mongoServer.getUri(), {})

    // create user
    newUser = new User({
      username: 'user1',
      password: 'password1234',
    });

    await newUser.save();

    token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

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
    // Create cart for current user
    newCart = new Cart({
      user: newUser._id,
      items: [
        { book: newBook._id, quantity: 2 },
      ],
    });
    await newCart.save();
  });

  afterEach(async () => {
    await Cart.deleteMany({})
  })

  describe('POST /api/orders', () => {
    it('should place an order and clear the user cart', async () => {
    
      const res = await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message').to.equal('Order placed successfully.');

      // Verify that the cart is empty after placing the order
      const updatedCart = await Cart.findOne({ user: newUser._id });
      expect(updatedCart.items).to.have.lengthOf(0);

      // Verify that an order record was created
      const orders = await Order.find({ userId: newUser._id });
      expect(orders).to.have.lengthOf(1);
    });
    
    it('should return 404 if cart is not present', async () => {
    
      // delete cart 
      await Cart.deleteMany({})

      const res = await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property('message').to.equal('Cart not found.');

    });
  });

  describe('GET /api/orders', () => {
    it('should get a user\'s order history', async () => {
      const res = await chai
        .request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.have.lengthOf(1); 

      const { book, quantity } = res.body[0].items[0]
      expect(quantity).to.equal(2)
      expect(book.title).to.equal(newBook.title)
      expect(book.author).to.equal(newBook.author)
      expect(book.price).to.equal(newBook.price)
      expect(book.genre).to.equal(newBook.genre)

    });
  });
});
