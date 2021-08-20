// Task 4: Modularize schema and model into own component
const mongoose = require('mongoose');

// Task 2: Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  email: { type: String, required: true },
});

// Task 3: Book Model            'books' is the name of the collection                   
const BookModel = mongoose.model('books', bookSchema);

module.exports = BookModel;
