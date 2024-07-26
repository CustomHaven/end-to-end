require("dotenv").config();
const fs = require("fs");

const db = require("./connect");

const sql = fs.readFileSync("./server/db/countries.sql").toString();
console.log(sql)
// const sql = fs.readFileSync(__dirname +).toString();

db.query(sql)
  .then(data => {
    db.end();
    console.log("Set up complete");
  })
  .catch(err => console.log(err));