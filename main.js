// main.js
//imports
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const session = require('express-session');

//sets app to express
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the engine
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Database connection pool
const pool = new Pool({
  user: 'sergior',
  host: 'localhost',
  database: 'BlogDB',
  password: 'password132',
  port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
	//sebds console msg if error
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the database');
  release();
});

// Routes
//sends user to index
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
