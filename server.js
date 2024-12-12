const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL Database connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "DBMS",
  database: "bakery",
});

// Test DB connection
db.connect(err => {
  if (err) {
    console.error("Failed to connect to MySQL database:", err.message);
    process.exit(1); // Exit the app if DB connection fails
  }
  console.log("Connected to MySQL database!");
});

// In-memory cart for demonstration (replace with DB in production)
let cart = [];

// Route to add items to the cart
app.post("/add-to-cart", (req, res) => {
  const { id, name, price, quantity } = req.body;

  if (!id || !name || !price || !quantity) {
    return res.status(400).json({ success: false, message: "Invalid item details." });
  }

  // Check if item already exists in the cart
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += quantity; // Update quantity if item exists
  } else {
    cart.push({ id, name, price, quantity }); // Add new item to the cart
  }

  res.json({ success: true, message: "Item added to cart", cart });
});

// Route to view the cart
app.get("/cart", (req, res) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // Calculate total price
  res.json({ success: true, cart, total });
});

// Route to handle order submission
app.post("/submit_order", (req, res) => {
  const { firstName, lastName, email, phone, address, items } = req.body;

  if (!firstName || !lastName || !email || !phone || !address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid order details." });
  }

  // Save order details to the `orders` table
  const orderQuery = `
    INSERT INTO orders (first_name, last_name, email, phone, address)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(orderQuery, [firstName, lastName, email, phone, address], (err, result) => {
    if (err) {
      console.error("Failed to save order:", err.message);
      return res.status(500).json({ success: false, message: "Failed to save order details." });
    }

    const orderId = result.insertId;

    // Save order items to the `order_items` table
    const orderItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity)
      VALUES ?
    `;
    const orderItems = items.map(item => [orderId, item.id, item.quantity]);

    db.query(orderItemsQuery, [orderItems], (err) => {
      if (err) {
        console.error("Failed to save order items:", err.message);
        return res.status(500).json({ success: false, message: "Failed to save order items." });
      }

      // Clear the cart (for demonstration)
      cart = [];
      res.json({ success: true, message: "Order submitted successfully!" });
    });
  });
});

// Route to handle checkout
app.post("/checkout", (req, res) => {
  const { firstName, lastName, email, phoneNumber, address } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !address) {
    return res.status(400).json({ success: false, message: "Invalid checkout details." });
  }

  res.json({ success: true, message: "Checkout completed successfully." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
