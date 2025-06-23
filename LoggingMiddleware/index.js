const express = require("express");
const dotenv = require("dotenv");
dotenv.config()
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { logging } = require("./logging")

const PORT = process.env.PORT;
const app = express();


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json())

// text logging function
app.post('/test-logging', (req, res) => {
    const {stack, level, package, message } = req.body;
   logging(stack, level, package, message);
   res.send("Compleated");
})

app.listen(PORT, () =>{
    console.log(`Server is Running on ${PORT}`);
})