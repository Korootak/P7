const express = require("express");
const app = express();
const morgan = require("morgan");
app.use(morgan("dev"));
const cors = require("cors");
require("dotenv").config();

app.use(express.json({ limit: "50mb", extended: false }));
app.use(cors());

// API Route
app.use("/api/uploads", express.static("uploads"));
app.use("/api/user", require("./routes/User"));
app.use("/api/feed", require("./routes/Feed"));
app.use("/api/auth/user", require("./routes/auth/user"));

// Server Start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("server started on port" + PORT);
});

module.exports = server;
