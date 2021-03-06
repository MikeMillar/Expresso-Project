const express = require('express');
const sqlite3 = require('sqlite3');
const apiRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const employeesRouter = require('./employees');
apiRouter.use('/employees', employeesRouter);

const menusRouter = require('./menus');
apiRouter.use('/menus', menusRouter);


module.exports = apiRouter;
