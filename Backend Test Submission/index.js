require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const shorturlRoutes = require("./Routes/sorturl.route.js");

app.use("/shorturls", shorturlRoutes);

app.use((err, req, res, next) => {
  if (err) {
    res.send("Error: " + err.message);
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});