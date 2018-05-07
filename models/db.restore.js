//In case something goes wrong and db.js is wiped out, copy this code and paste it in db.js -- thanks me later ;)

const Sequelize = require('sequelize');
const sequelize = new Sequelize('sqlite:sswmfa.db');

module.exports = sequelize;
