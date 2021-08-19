const mongoose = require('mongoose');

// Book Schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  email: { type: String, required: true },
});

// Book Model                        
const BookModel = mongoose.model('books', bookSchema);

module.exports = BookModel;
