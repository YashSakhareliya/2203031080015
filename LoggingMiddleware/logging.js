const fs = require("fs")
const dotenv = require("dotenv");
dotenv.config()

const LOG_URL = process.env.LOG_API;
const TOKEN = process.env.TOKEN;

const logging = async (stack = "backend", level, package, message) => {

    const BODY = {
        stack: stack,
        level: level,
        package: package,
        message: message
    }
    // console.log(TOKEN);
    const response = await fetch(LOG_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify(BODY)
    })

    
    console.log(response);
    // for (check successfully responce 
    const data = response + "\n";
    fs.appendFile('logs.txt', data, (err) => {
        if(err){
            console.error("error in store txt file: ", err.message);
        }
    })
}

module.exports = { logging };