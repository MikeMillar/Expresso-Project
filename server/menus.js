const express = require('express');
const sqlite3 = require('sqlite3');
const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('id', (req, res, next, id) => {
  db.get('SELECT * FROM Menu WHERE id = $id',
  {
    $id: req.params.id
  }, (err, menu) => {
    if (err) {
      res.sendStatus(500);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

menusRouter.param('menuItemId', (req, res, next, id) => {
  db.get('SELECT * FROM MenuItem WHERE id = $id',
  {
    $id: req.params.menuItemId
  }, (err, menuItem) => {
    if (err) {
      res.sendStatus(500);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, menu) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({menus: menu});
    }
  })
});

menusRouter.get('/:id', (req, res, next) => {
  res.status(200).send({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
  const menu = req.body.menu;
  const title = menu.title;
  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {$title: title};
  if (!title) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM Menu WHERE id = $id', {$id: this.lastID}, (err, selectedMenu) => {
          if (err) {
            next(err);
          } else {
            res.status(201).send({menu: selectedMenu});
          }
        })
      }
    })
  }
});

menusRouter.put('/:id', (req, res, next) => {
  const menu = req.body.menu;
  const title = menu.title;
  const sql = 'UPDATE Menu SET title = $title WHERE id = $id';
  const values = {$title: title, $id: req.menu.id};
  if (!title) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM Menu WHERE id = $id', {$id: req.menu.id}, (err, selectedMenu) => {
          if (err) {
            next(err);
          } else {
            res.status(200).send({menu: selectedMenu});
          }
        })
      }
    })
  }
});

menusRouter.delete('/:id', (req, res, next) => {
  db.get('SELECT * FROM MenuItem WHERE menu_id = $menuId',
  {$menuId: req.menu.id}, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      res.sendStatus(400);
    } else {
      db.run('DELETE FROM Menu WHERE id = $id', {$id: req.menu.id}, function(err) {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        }
      })
    }
  })
});

menusRouter.get('/:id/menu-items', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId',
  {$menuId: req.menu.id}, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({menuItems: menuItems});
    }
  })
});

menusRouter.post('/:id/menu-items', (req, res, next) => {
  const menuItem = req.body.menuItem;
  const name = menuItem.name;
  const description = menuItem.description;
  const inventory = menuItem.inventory;
  const price = menuItem.price;
  const menuId = req.menu.id;
  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };
  if (!name || !description || !inventory || !price) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: this.lastID}, (err, selectedMenuItem) => {
          if (err) {
            next(err);
          } else {
            res.status(201).send({menuItem: selectedMenuItem});
          }
        })
      }
    })
  }
});

menusRouter.put('/:id/menu-items/:menuItemId', (req, res, next) => {
  const menuItem = req.body.menuItem;
  const name = menuItem.name;
  const description = menuItem.description;
  const inventory = menuItem.inventory;
  const price = menuItem.price;
  const menuId = req.menu.id;
  const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId,
    $id: req.menuItem.id
  };
  if (!name || !description || !inventory || !price) {
    res.sendStatus(400);
  } else {
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get('SELECT * FROM MenuItem WHERE id = $id',
        {$id: req.menuItem.id}, (err, selectedMenuItem) => {
          if (err) {
            next(err);
          } else {
            res.status(200).send({menuItem: selectedMenuItem});
          }
        })
      }
    })
  }
});

menusRouter.delete('/:id/menu-items/:menuItemId', (req, res, next) => {
  db.run('DELETE FROM MenuItem WHERE id = $id', {$id: req.menuItem.id}, function(err) {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  })
});






















module.exports = menusRouter;
