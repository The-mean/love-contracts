const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

// Test route
app.get("/", (req, res) => {
    res.send("Love Contracts API is running...");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use("/api/auth", authRoutes);
