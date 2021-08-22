'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const mongoose = require('mongoose');

// Moduel requirements
const BookModel = require('./modules/books');

const app = express();
// Needed to display json in post
app.use(express.json());
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


// Routes
app.get('/', (req, res) => {
  res.send('Hello, from the Can of Books server! :)');
});

app.get('/test', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
  jwt.verify(token, getKey, {}, function (err, user) {
    if (err) {
      res.status(500).send('invlaid token');
    }
    res.send(user);
  });
});

// Task 6 create books route
app.get('/books', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, getKey, {}, function (err, user) {
      if (err) {
        res.status(500).send('Invalid token');
      } else {
        // Gets results from schema
        BookModel.find((err, dbResults) => {
          if (err) {
            res.send();
            console.log('Cannot access DB');
          } else {
            res.status(200).send(dbResults);
          }
        });
      }
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).send('DB Error');
  }
});

// L13 Task 1:
app.post('/post-books', (req, res) => {
  // test to see post route
  // res.send('Post Route Duh');
  try {
    let { title, description, status, email } = req.body;
    // L13 Task 2:
    // let objLit = {title, description, status, email};
    // L13 Task 3:
    let newBook = new BookModel({ title, description, status, email });
    newBook.save();
    res.send(newBook);
    // L13 Task 7 Server Response
    console.log(`New Book Posted: `, newBook);
  } catch (err) { // L13 Task 4:
    res.status(500).send('Post Error: ', err);
  }
});

// L13 Task 1 card 2
app.delete('/delete-book/:id', async (req, res) => {
  let bookId = req.params.id;
  await BookModel.findByIdAndDelete(bookId);
  res.send(`Book Deleted!`);
});

// Task 5: Seed the Database
app.get('/seed', seed);
async function seed(req, res) {
  let books = await BookModel.find({});
  if (books.length === 0) {
    await addBook({
      title: 'Title',
      description: 'Description',
      status: '200',
      email: 'email@gmail.com',
    });
    await addBook({
      title: 'Title2',
      description: 'Description2',
      status: '2002',
      email: 'email@gmail.com2',
    });
    await addBook({
      title: 'Title3',
      description: 'Description3',
      status: '2003',
      email: 'email@gmail.com3',
    });
  }
  res.send('Seeded the Database');
}

// Adds book
async function addBook(obj) {
  let newBook = new BookModel(obj);
  return await newBook.save();
}

// Clears the database
app.get('/clear', clear);
async function clear(req, res) {
  try {
    await BookModel.deleteMany({});
    res.status(200).send('Goodbye Database :(');
  }
  catch (err) {
    res.status(500).send('Error Clearing Database');
  }
}

//Task 1: Connects to mongoDB 
mongoose.connect('mongodb://127.0.0.1:27017/books', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to the database');
  });

app.get('/*', (request, response) => {
  response.status(404).send('Path does not exists');
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));



