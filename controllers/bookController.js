const Book = require('../models/Book');
const mongoose = require('mongoose')

// Controller to get a paginated list of books
exports.getPaginatedBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy

    // Calculate the skip value to skip the appropriate number of records
    const skip = (page - 1) * limit;

    // Determine the sorting criteria (e.g., title, author, price)
    const sortCriteria = {};
    if (sortBy === 'title') {
      sortCriteria.title = 1; // Sort ascending by title
    } else if (sortBy === 'author') {
      sortCriteria.author = 1; // Sort ascending by author
    } else if (sortBy === 'price') {
      sortCriteria.price = 1; // Sort ascending by price
    } else if (sortBy === 'genre') {
      sortCriteria.genre = 1; // Sort ascending by genre
    } else if (sortBy === 'availability') {
      sortCriteria.availability = 1; // Sort ascending by availability
    } else if (sortBy === 'createdAt') {
      sortCriteria.createdAt = 1; // Sort ascending by createdAt
    } else {
      sortCriteria.updatedAt = 1; // Sort ascending by updatedAt by default
    }

    const books = await Book.find()
      .skip(skip)
      .limit(limit)
      .sort(sortCriteria);

    res.json(books);
  } catch (error) {
    next(error)
  }
};

// Controller to create a new book
exports.createBook = async (req, res, next) => {
  try {
    const { title, author, genre, price, availability } = req.body;
    const newBook = new Book({ title, author, genre, price, availability });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    next(error)
  }
};

// Controller to get a book by ID
exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json(book);
  } catch (error) {
  next(error)
  }
};

// Controller to update a book by ID
exports.updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBookData = req.body; // Data to update the book with
    const updatedBook = await Book.findByIdAndUpdate(id, updatedBookData, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json(updatedBook);
  } catch (error) {
    next(error)
  }
};

// Controller to delete a book by ID
exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndRemove(id);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.sendStatus(204);
  } catch (error) {
    next(error)
  }
};

exports.searchBooks = async (req, res, next) => {
  try {
    const { query } = req.query;
    const books = await Book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } }, // Case-insensitive search for title
        { author: { $regex: query, $options: 'i' } }, // Case-insensitive search for author
      ],
    });

    res.json(books);
  } catch (error) {
    next(error)
  }
};

// Controller to add a rating and review for a book
exports.addRatingAndReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.userData;
    const { rating, reviewText } = req.body;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    // Add the rating and review
    if (rating)
      book.ratings.push({ userId, rating });
    if (reviewText)
      book.reviews.push({ userId, text: reviewText });

    // Save the updated book with ratings and reviews
    await book.save();

    res.json({ message: 'Rating and review added successfully.' });
  } catch (error) {
    next(error)
  }
};


// Controller to fetch ratings and reviews for a book
exports.getRatingsAndReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    const ratings = book.ratings;
    const reviews = book.reviews;

    res.json({ ratings, reviews });
  } catch (error) {
    next(error)
  }
};
