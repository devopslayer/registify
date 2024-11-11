const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

let users = [];

// Get users
app.get("/users", (req, res) => {
  const page = parseInt(req.query._page, 10) || 1;
  const limit = parseInt(req.query._limit, 10) || users.length;
  const startIndex = (page - 1) * limit;
  const paginatedUsers = users.slice(startIndex, startIndex + limit);

  res.setHeader("X-Total-Count", users.length);
  res.json(paginatedUsers);
});

// Add user
app.post("/users", (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  res.json(newUser);
});

// Update user
app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const index = users.findIndex((user) => user.id === userId);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Delete user
app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  users = users.filter((user) => user.id !== userId);
  res.json({ message: "User deleted" });
});

// 404 errors
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1>");
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
