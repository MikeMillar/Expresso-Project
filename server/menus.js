const express = require('express');
const sqlite3 = require('sqlite3');
const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');





























module.exports = menusRouter;
