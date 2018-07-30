const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');

module.exports = app;

// Database
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Middleware
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(errorHandler());

// Routers
const apiRouter = require('./server/api');
app.use('/api', apiRouter);

// Server

const PORT = process.env.PORT || 4000;
app.use(express('static'));
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
