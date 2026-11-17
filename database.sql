CREATE DATABASE IF NOT EXISTS coffee_shop_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coffee_shop_db;

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  description VARCHAR(500),
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  availability ENUM('Available','Unavailable') NOT NULL DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO menu_items (name, category, description, price, stock, availability)
SELECT * FROM (
  SELECT 'Espresso' AS name, 'Coffee' AS category, 'A rich, concentrated coffee shot.' AS description, 120.00 AS price, 25 AS stock, 'Available' AS availability
  UNION ALL SELECT 'Cappuccino', 'Coffee', 'Espresso with steamed milk and a soft foam finish.', 180.00, 18, 'Available'
  UNION ALL SELECT 'Iced Latte', 'Cold Coffee', 'Chilled espresso blended with fresh milk.', 210.00, 14, 'Available'
  UNION ALL SELECT 'Mocha', 'Coffee', 'Espresso, chocolate and steamed milk.', 220.00, 10, 'Available'
  UNION ALL SELECT 'Blueberry Muffin', 'Bakery', 'Soft muffin with blueberry pieces.', 150.00, 8, 'Available'
) AS sample
WHERE NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1);