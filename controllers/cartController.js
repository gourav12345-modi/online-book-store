const Cart = require('../models/Cart');
const Book = require('../models/Book')

// Add a book to the user's cart
exports.addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity } = req.body;
    const { userId } = req.userData;

    // Find the user's cart or create one if it doesn't exist
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the book is available in sufficient quantity
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }
    if (quantity > book.availability) {
      return res.status(400).json({ message: 'Requested quantity exceeds availability.' });
    }

    // Check if the book is already in the cart
    const existingCartItem = cart.items.find((item) => item.book.equals(book._id));

    if (existingCartItem) {
      // If the book is already in the cart, update the quantity
      existingCartItem.quantity += quantity;
    } else {
      // If the book is not in the cart, add it as a new item
      cart.items.push({ book: bookId, quantity });
    }

    await cart.save();

    // Subtract the quantity from book availability
    book.availability -= quantity;
    await book.save();
    res.status(201).json({ message: 'Book added to cart successfully.' });
  } catch (error) {
    next(error)
  }
};

// Remove a book from the user's cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { userId } = req.userData;
    const quantityToRemove = req.body.quantity || 1; // Default to removing 1 book if quantity is not specified

    // Find the user's cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Find the cart item to remove
    const cartItemToRemove = cart.items.find(
      (item) => item.book.toString() === bookId
    );

    if (!cartItemToRemove) {
      return res.status(404).json({ message: 'Book not found in cart.' });
    }

    // Ensure that the quantity to remove is not greater than the quantity in the cart
    if (cartItemToRemove.quantity < quantityToRemove) {
      return res.status(400).json({ message: 'Requested quantity to remove exceeds cart quantity.' });
    }

    // Update the cart item's quantity
    cartItemToRemove.quantity -= quantityToRemove;

    // If the quantity reaches 0, remove the item from the cart
    if (cartItemToRemove.quantity === 0) {
      cart.items = cart.items.filter((item) => item.book.toString() !== bookId);
    }

    await cart.save();

    // Add the quantity back to book availability
    const book = await Book.findById(bookId);
    book.availability += quantityToRemove;
    await book.save();

    res.status(204).send();

  } catch (error) {
    next(error)
  }
};

// View the user's cart
exports.viewCart = async (req, res, next) => {
  try {
    const { userId } = req.userData;

    // Find the user's cart and populate book details
    const cart = await Cart.findOne({ user: userId }).populate('items.book');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Calculate the total price using the virtual method
    const totalPrice = cart.totalPrice;

    res.json({ cart: cart.items, totalPrice });
  } catch (error) {
    next(error)
  }
};

