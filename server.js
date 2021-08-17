'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

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

  // STEP 3: to prove that everything is working correctly, send the opened jwt back to the front-end
  // DONE


app.get('/*', (request, response) => {
  response.status(404).send('Path does not exists');
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
