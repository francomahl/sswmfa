//In case something goes wrong and db.js is wiped out, copy this code and paste it in db.js -- thanks me later ;)

var sqlite3 = require('sqlite3').verbose(),
db = new sqlite3.Database('sswmfa.sql'),
SDB = {};

module.exports = SDB;
