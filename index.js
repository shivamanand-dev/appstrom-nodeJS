const connectMongo = require("./db");
connectMongo();

const express = require("express");
const app = express();

// CORS
var cors = require("cors");
app.use(cors());

// Enviornment Variables
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT;

// Routes
app.use(express.json());
app.use("/api/auth", require("./routes/auth/auth"));
app.use("/api/activity", require("./routes/activityTracker/activity"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
