const Sequelize = require('sequelize');
const sequelize = new Sequelize('sqlite:sswmfa.db');

module.exports = sequelize;
