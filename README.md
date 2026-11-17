# Brew & Bean — Coffee Shop Menu Management

A CRUD assignment project using HTML, CSS, Vanilla JavaScript, Node.js, Express and MySQL.

## Features
- Create, view, update and delete menu items
- Search by item name, category or description
- Filter by category
- Dashboard statistics: menu item count, unique categories and total stock
- Responsive interface
- MySQL persistence through an Express API

## Requirements
- Node.js
- XAMPP with MySQL

## Setup
1. Start MySQL in XAMPP.
2. Open `http://localhost/phpmyadmin`.
3. Import `database.sql` using the Import tab.
4. Copy `.env.example` to `.env`. For a default XAMPP install, leave `DB_PASSWORD` blank.
5. Open a terminal in this project folder and run `npm install`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## API
- `GET /api/menu` — list menu items
- `POST /api/menu` — create a menu item
- `PUT /api/menu/:id` — update a menu item
- `DELETE /api/menu/:id` — delete a menu item

## Database
Database: `coffee_shop_db`  
Table: `menu_items`

Do not commit `.env` or `node_modules` to GitHub.
