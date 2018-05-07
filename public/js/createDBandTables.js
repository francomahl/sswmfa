function createDB(){
  var classes = "";
  //call save()
  saveER();
  createRouterForTables(); //Creates router for /createTable endpoint 
  classes = createClasses();

  //Create DB file
  var dbConfigTemplate = 
  "const Sequelize = require('sequelize');"+ '\n' +
  "const sequelize = new Sequelize('sqlite:sswmfa.db');"+ '\n' + '\n' +
  '#{classes}' +
  'module.exports = sequelize;' + '\n';

  var dbConfigValues = { classes: classes };
  var dbConfigContent = $.tmpl(dbConfigTemplate, dbConfigValues);

  createFile(dbConfigContent, "db.js", '../models/', "script" );

  $('#createTableButton').prop('disabled', false);
};

function createTables(){
  //create db tables
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/render/createTables',
    success: function(data) {
      console.log('tables created');
      $('#CreateRoutesButton').prop('disabled', false);
      $('#PagesButton').prop('disabled', true);
      $('#PlayButton').prop('disabled', true);
    }
  });
}

function createClasses(){
  let dbClasses = '';
  if (erClasses.length < 1) {
    return dbClasses
  }; // if there are no classes then return

  erClasses.forEach(function (erClass, cIndex){
    const className = erClass.name.split(" ").join("_");
    dbClasses +=
    `const ${className} = sequelize.define('${className}', {` + '\n' +
    " id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }," + '\n';
    erClass.properties.forEach(function (property, pIndex){  
      const fieldName = property.name.split(" ").join("_");
      const fieldType = property.type.toLowerCase();
      let dataType = ''; 

      switch(fieldType)
      {
        case "integer":
        case "number":
          dataType = 'INTEGER';
          break;
        case "bigint":
          dataType = 'BIGINT';
          break;
        /*case "float":
        case "real":
          dataType = 'FLOAT';
          break;
        case "double":
          dataType = 'DOUBLE';
          break;*/
        case "text":
        case "textarea":
          dataType = 'TEXT';
          break;
        case "date":
        case "datetime":
          dataType = 'DATE';
          break;          
        default: //Type STRING(255) by default
          dataType = "STRING";
      }
      dbClasses +=
      `  ${fieldName}: { type: Sequelize.${dataType}`;
      dbClasses += (property.nullable ? '' : ', allowNull: false' );
      dbClasses += (property.unique ? ', unique: true' : '' );
      dbClasses += ((pIndex+1 === erClass.properties.length) ? " }" : " }," );
      dbClasses += '\n';
    });// end for each field
    dbClasses += 
    '});' + '\n' + '\n';
  });//end for each class

  return dbClasses;
}

function createRouterForTables(){
  const routerForTablesContent = 
  "var express = require('express');" + '\n' +
  "var router = express.Router();" + '\n' +
  "var sequelize = require('../models/db');" + '\n' + '\n' +
  "router.get('/createTables', function(req, res){" + '\n' +
  "  sequelize.sync({force: true});" + '\n' +
  "  res.redirect('back');" + '\n' +
  "});" + '\n' + '\n' +
  "module.exports = router;" + '\n';

	createFile(routerForTablesContent, "render.js", '../routes/', "script" );
}