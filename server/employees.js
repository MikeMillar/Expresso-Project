const express = require('express');
const sqlite3 = require('sqlite3');
const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('id', (req, res, next, id) => {
  db.get('SELECT * FROM Employee WHERE id = $id',
  {
    $id: req.params.id
  }, (err, employee) => {
    if (err) {
      res.sendStatus(500);
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

employeesRouter.param('timesheetId', (req, res, next, id) => {
  db.get('SELECT * FROM Timesheet WHERE id = $id',
  {
    $id: req.params.timesheetId
  }, (err, timesheet) => {
    if (err) {
      res.sendStatus(500);
      next(err);
    } else if (timesheet) {
      req.timesheet = timesheet;
      next()
    } else {
      res.sendStatus(404);
    }
  })
});

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({employees: employees});
    }
  })
});

employeesRouter.get('/:id', (req, res, next) => {
  res.status(200).send({employee: req.employee});
});

employeesRouter.post('/', (req, res, next) => {
  const employee = req.body.employee;
  const name = employee.name;
  const position = employee.position;
  const wage = employee.wage;
  const isCurrentEmployee = employee.isCurrentEmployee === 0 ? 0 : 1;
  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };
  if (!name || !position || !wage) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM Employee WHERE id = $id', {$id: this.lastID}, (err, selectedEmployee) => {
          if (err) {
            next(err);
          } else {
            res.status(201).send({employee: selectedEmployee});
          }
        })
      }
    })
  }
});

employeesRouter.put('/:id', (req, res, next) => {
  const employee = req.body.employee;
  const name = employee.name;
  const position = employee.position;
  const wage = employee.wage;
  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $id: req.employee.id
  };
  if (!name || !position || !wage) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM Employee WHERE id = $id',
        {
          $id: req.params.id
        }, (err, selectedEmployee) => {
          if (err) {
            next(err);
          } else {
            res.status(200).send({employee: selectedEmployee});
          }
        })
      }
    })
  }
});

employeesRouter.delete('/:id', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE id = $id';
  const values = {
    $id: req.employee.id
  };
  db.run(sql, values, function(err) {
    if (err) {
      next(err);
    } else {
      db.get('SELECT * FROM Employee WHERE id = $id',
      {
        $id: req.employee.id
      }, (err, selectedEmployee) => {
        if (err) {
          next(err);
        } else {
          res.status(200).send({employee: selectedEmployee});
        }
      })
    }
  })
});

employeesRouter.get('/:id/timesheets', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $id',
  {
    $id: req.employee.id
  }, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({timesheets: timesheets});
    }
  })
});

employeesRouter.post('/:id/timesheets', (req, res, next) => {
  const timesheet = req.body.timesheet;
  const hours = timesheet.hours;
  const rate = timesheet.rate;
  const date = timesheet.date;
  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: req.employee.id
  };
  if (!hours || !rate || !date) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM Timesheet WHERE id = $id',
        {
          $id: this.lastID
        }, (err, selectedTimesheet) => {
          if (err) {
            next(err);
          } else {
            res.status(201).send({timesheet: selectedTimesheet});
          }
        })
      }
    })
  }
});

employeesRouter.put('/:id/timesheets/:timesheetId', (req, res, next) => {
  const timesheet = req.body.timesheet;
  const hours = timesheet.hours;
  const rate = timesheet.rate;
  const date = timesheet.date;
  const employeeId = req.employee.id;
  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId,
    $timesheetId: req.timesheet.id
  };
  if (!hours || !rate || !date) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM Timesheet WHERE id = $id',
        {
          $id: req.params.timesheetId
        }, (err, selectedTimesheet) => {
          if (err) {
            next(err);
          } else {
            res.status(200).send({timesheet: selectedTimesheet});
          }
        })
      }
    })
  }
});

employeesRouter.delete('/:id/timesheets/:timesheetId', (req, res, next) => {
  db.run('DELETE FROM Timesheet WHERE id = $id', {$id: req.timesheet.id}, function(err) {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  })
});






















module.exports = employeesRouter;
