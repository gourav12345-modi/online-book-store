const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [cartItemSchema],
});

// Virtual method to calculate the total price
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, item) => {
    return total + item.quantity * item.book.price;
  }, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;