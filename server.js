'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const mongoose = require('mongoose');

// Moduels
const BookModel = require('./modules/books');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

//------------------------------------


// SRC https://www.npmjs.com/package/jsonwebtoken
// -----------------------------------------------
let client = jwksClient({
  jwksUri: 'https://dev-b-6iwqw4.us.auth0.com/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    let signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
// -----------------------------------------------

// Clears the database
app.get('/clear', clear);
async function clear(req, res) {
  try {
    await BookModel.deleteMany({});
    res.status(200).send('Goodbye Database :(');
  }
  catch(err) {
    res.status(500).send('Error Clearing Database');
  }
}


app.get('/', (request, response) => {
  response.send('Hello, from the Can of Books server! :)');
});

app.get('/test', (request, response) => {

  // TODO: DONE
  // STEP 1: get the jwt from the headers
  const token = request.headers.authorization.split(' ')[1];

  // STEP 2. use the jsonwebtoken library to verify that it is a valid jwt
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      response.status(500).send('invalid token');
    }
    response.send(user);
  });
});

app.get('/books', async (req, res) => {
  try {
    let booksdb = await BookModel.find({});
    res.status(200).send(booksdb);
  }
  catch (err) {
    res.status(500).send('DB Error');
  }
});

// Book Schema
// const bookSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   status: { type: String, required: true },
//   email: { type: String, required: true },
// });

// Book Model                        
// const BookModel = mongoose.model('books', bookSchema);

mongoose.connect('mongodb://127.0.0.1:27017/books', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to the database');

    let newBook = new BookModel({
      title: 'Title2',
      description: 'Description2',
      status: '2002',
      email: 'email@gmail.com2',
    });
    await newBook.save();
  });



app.get('/*', (request, response) => {
  response.status(404).send('Path does not exists');
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));

