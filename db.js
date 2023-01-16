/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;

/*

Not sure why this is not working. It seems like there is an error with connecting to the Database

 */