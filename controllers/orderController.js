const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Place an order
exports.placeOrder = async (req, res, next) => {
  try {
    const { userId } = req.userData;

    // Find the user's cart and populate the 'items.book' field
    const cart = await Cart.findOne({ user: userId }).populate('items.book', 'title author price');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Calculate the total price using the virtual method
    const totalPrice = cart.totalPrice;

    // Create a new order
    const order = new Order({
      userId,
      items: cart.items,
      totalPrice,
    });

    // Save the order
    await order.save();

    // Clear the user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully.' });
  } catch (error) {
    next(error)
  }
};

// Get user's order history
exports.getOrderHistory = async (req, res, next) => {
  try {
    const { userId } = req.userData;

    // Find all orders by the user
    const orders = await Order.find({ userId }).populate('items.book').sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    next(error)
  }
};

