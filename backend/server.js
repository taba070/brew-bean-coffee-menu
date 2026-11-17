const express = require('express');
const path = require('path');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// READ: get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('GET /api/menu:', error.message);
    res.status(500).json({ message: 'Could not load menu items. Check MySQL connection.' });
  }
});

// CREATE: add a menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, category, description = '', price, stock = 0, availability = 'Available' } = req.body;
    if (!name?.trim() || !category?.trim() || price === undefined || Number(price) < 0 || !Number.isFinite(Number(price)) || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Enter a name, category, valid price and non-negative whole-number stock.' });
    }
    const [result] = await pool.execute(
      'INSERT INTO menu_items (name, category, description, price, stock, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), category.trim(), description.trim(), Number(price), Number(stock), availability === 'Unavailable' ? 'Unavailable' : 'Available']
    );
    const [rows] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('POST /api/menu:', error.message);
    res.status(500).json({ message: 'Could not add menu item.' });
  }
});

// UPDATE: edit a menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { name, category, description = '', price, stock = 0, availability = 'Available' } = req.body;
    if (!name?.trim() || !category?.trim() || price === undefined || !Number.isFinite(Number(price)) || Number(price) < 0 || !Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: 'Enter a name, category, valid price and non-negative whole-number stock.' });
    }
    const [result] = await pool.execute(
      'UPDATE menu_items SET name=?, category=?, description=?, price=?, stock=?, availability=? WHERE id=?',
      [name.trim(), category.trim(), description.trim(), Number(price), Number(stock), availability === 'Unavailable' ? 'Unavailable' : 'Available', Number(req.params.id)]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Menu item not found.' });
    const [rows] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [Number(req.params.id)]);
    res.json(rows[0]);
  } catch (error) {
    console.error('PUT /api/menu/:id:', error.message);
    res.status(500).json({ message: 'Could not update menu item.' });
  }
});

// DELETE: remove a menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM menu_items WHERE id = ?', [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Menu item not found.' });
    res.json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/menu/:id:', error.message);
    res.status(500).json({ message: 'Could not delete menu item.' });
  }
});

app.listen(PORT, () => {
  console.log(`Brew & Bean is running at http://localhost:${PORT}`);
});