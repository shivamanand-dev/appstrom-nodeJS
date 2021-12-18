const connectMongo = require("./db");
connectMongo();

const express = require("express");
const app = express();

// Enviornment Variables
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;

// Routes
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
