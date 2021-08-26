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

app.get('/allbooks', (req, res) => {
  BookModel.find({}, (err, dbResults) => {
    if (err) {
      res.send();
      console.log('Cannot access DB');
    } else {
      res.status(200).send(dbResults);
    }
  });
})

// Task 6 create books route
app.get('/books', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const email = req.query.email;
    jwt.verify(token, getKey, {}, function (err, user) {
      if (err) {
        res.status(500).send('Invalid token');
      } else {
        // Gets results from schema
        BookModel.find({ email }, (err, dbResults) => {
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
    // console.log(`New Book Posted: `, newBook);
  } catch (err) { // L13 Task 4:
    res.status(500).send('Post Error: ', err);
  }
});

// L13 Task 1 card 2
app.delete('/delete-book/:id', (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    // jsonwebtoken dock - https://www.npmjs.com/package/jsonwebtoken
    jwt.verify(token, getKey, {}, function (err, user) {
      if (err) {
        res.status(500).send('invlaid token');
      } else {
        let bookId = req.params.id;
        let email = req.query.email;
        if (email === user.email) {
          BookModel.findByIdAndDelete(bookId, (err, success) => {
            console.log(success);
            res.send(`Book Deleted!`);
          });
        }
      }
    });
  } catch (err) {
    res.status(500).send('Delete Error: ', err);
  }
});

// Updates books
app.put('/put-book/:id', async (req, res) => {
  try {
    let bookId = req.params.id;
    let { title, description, status, email } = req.body;
    const updatedBook = await BookModel.findByIdAndUpdate(bookId, { title, description, status, email }, { new: true, overwrite: true });
    res.status(200).send(updatedBook);
  } catch (err) {
    res.status(500).send('Unable to update book', err);
  }
});

// Task 5: Seed the Database
app.get('/seed', seed);
async function seed(req, res) {
  let books = await BookModel.find({});
  if (books.length === 0) {
    await addBook({
      title: 'The Daily Stoic',
      description: 'The Daily Stoic is an original translation of selections from several stoic philosophers including Epictetus, Marcus Aurelius, Seneca, Musonius Rufus, Zeno and others. It aims to provide lessons about personal growth, life management and practicing mindfulness.',
      status: 'Amazing',
      email: 'mark28ten@gmail.com',
    });
    await addBook({
      title: 'Meditations',
      description: 'One of the world\'s most famous and influential books, Meditations, by the Roman emperor Marcus Aurelius (A.D. 121–180), incorporates the stoic precepts he used to cope with his life as a warrior and administrator of an empire. Ascending to the imperial throne in A.D. 161, Aurelius found his reign beset by natural disasters and war. In the wake of these challenges, he set down a series of private reflections, outlining a philosophy of commitment to virtue above pleasure and tranquility above happiness.',
      status: 'Cool',
      email: 'mark28ten@gmail.com',
    });
    await addBook({
      title: 'The Science of Rick and Morty: The Unofficial Guide to Earth\'s Stupidest Show',
      description: 'Adult Swim’s Rick and Morty is one of the smartest (and most insane) shows on television. Genius alcoholic Rick Sanchez and his hapless grandson Morty have explored everything from particle physics to human augmentation and much more in their intergalactic adventures through the multiverse. With biting humor and plenty of nihilism, Rick and Morty employs cutting-edge scientific theories in every episode. But, outside of Rick’s garage laboratory, what are these theories truly about and what can they teach us about ourselves?',
      status: 'Awesome',
      email: 'mark28ten@gmail.com',
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



