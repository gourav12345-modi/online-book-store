const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  availability: {
    type: Number,
    default: 10, // by default making 10 copies available
  },
  ratings: [
    {
      _id: false,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
    },
  ],
  reviews: [
    {
      _id: false,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    },
  ],
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
