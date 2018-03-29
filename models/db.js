var sqlite3 = require('sqlite3').verbose(),
db = new sqlite3.Database('sswmfa.sql'),
SDB = {};

module.exports = SDB;
