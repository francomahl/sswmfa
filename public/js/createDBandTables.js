function createDB(){
  const dbName = "SDB";
  var queries = "";
  //call save()
  saveER();
  createRouterForTables(); //Creates router with endpoint for calling /createTable# functions
  queries = createQueries(dbName);

  //Create DB file
  var dbConfigTemplate = 
  "var sqlite3 = require('sqlite3').verbose(),"+ '\n' +
  "db = new sqlite3.Database('sswmfa.sql'),"+ '\n' +
  '#{dbName} = {};'+ '\n' + '\n' +
  '#{queries}'+ '\n' +
  'module.exports = #{dbName};' + '\n';

  var dbConfigValues = { queries: queries, dbName: dbName };
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

function createQueries(dbName){
  var dbQueries = "";
  if (erClasses.length < 1) {
    return dbQueries
  }; // if there are no classes then exit

  dbQueries = '';
  //create tables function


  for ( var classIndex = 0; classIndex < erClasses.length; classIndex++ ){
    var uniquesCount = 0;
    var iLastComma = 0;
    var uniques = ', UNIQUE (id,';
    dbQueries +=
	  dbName+".createTable"+ (classIndex+1) +" = function(callback){"+ '\n' +
    '	db.run("DROP TABLE IF EXISTS ' + erClasses[classIndex].name.split(" ").join("_") + '", function(err) {'+ '\n' +
    '		db.run("CREATE TABLE IF NOT EXISTS ' + erClasses[classIndex].name.split(" ").join("_") + ' (id INTEGER PRIMARY KEY AUTOINCREMENT,';
    for ( var classFieldI = 0; classFieldI < erClasses[classIndex].properties.length; classFieldI++ ){
      if (erClasses[classIndex].properties[classFieldI].nullable){
        dbQueries += ' ' +  erClasses[classIndex].properties[classFieldI].name.split(" ").join("_") + ' TEXT,';
      } else {
        dbQueries += ' ' +  erClasses[classIndex].properties[classFieldI].name.split(" ").join("_") + ' TEXT NOT NULL,';
      };
      if (erClasses[classIndex].properties[classFieldI].unique){
        uniquesCount ++;
        uniques += erClasses[classIndex].properties[classFieldI].name.split(" ").join("_") + ', ';
      };
    };
    //Remove last comma from dbQueries
    iLastComma = dbQueries.lastIndexOf(',');
    dbQueries = dbQueries.slice(0, iLastComma) + dbQueries.slice(iLastComma).replace(',', '');
    //check if there are unique columns
    if ( uniquesCount > 0 ){
      //Remove last comma from uniques
      iLastComma = uniques.lastIndexOf(',');
      uniques = uniques.slice(0, iLastComma) + uniques.slice(iLastComma).replace(',', '');
      dbQueries += uniques + '))';
    } else {
      dbQueries += ')'; 
    }
    dbQueries += '", function(err) {'+ '\n' + 
    "			callback(null);"+ '\n' + 
    '		});' + '\n' + 
    '	});' + '\n' + 
    '}' + '\n' +'\n';
  }//end for each class

  //CRUDs
  for ( var classCrudIndex = 0; classCrudIndex < erClasses.length; classCrudIndex++ ){
    var iLastComma = 0;
    var className = erClasses[classCrudIndex].name.split(" ").join("_");
    var insertVars = '';
    var dataFields = '';
    var updateFields = '';
    for ( var classFieldI = 0; classFieldI < erClasses[classCrudIndex].properties.length; classFieldI++ ){
      insertVars += '?, ';
      dataFields += 'data.' + erClasses[classCrudIndex].properties[classFieldI].name.split(" ").join("_") + ', ';
      updateFields += erClasses[classCrudIndex].properties[classFieldI].name.split(" ").join("_") + ' = ?, ';
    }
    //Remove last comma from insertVars
    iLastComma = insertVars.lastIndexOf(',');
    insertVars = insertVars.slice(0, iLastComma) + insertVars.slice(iLastComma).replace(',', '');
    //Remove last comma from dataFields
    iLastComma = dataFields.lastIndexOf(',');
    dataFields = dataFields.slice(0, iLastComma) + dataFields.slice(iLastComma).replace(',', '');
    //Remove last comma from updateFields
    iLastComma = updateFields.lastIndexOf(',');
    updateFields = updateFields.slice(0, iLastComma) + updateFields.slice(iLastComma).replace(',', '');

    dbQueries +=
    dbName+".insertOneIn"+className+" = function(data){"+ '\n'+
    '  var stmt = db.prepare("INSERT INTO '+className+ ' VALUES (?, ' + insertVars + ')");'+ '\n'+
    '  stmt.run(null, '+dataFields+');'+ '\n'+
    '  stmt.finalize();}'+ '\n'+ '\n';

    dbQueries +=
    dbName+".updateOneIn"+className+" = function(data){"+ '\n'+
    '  var stmt = db.prepare("UPDATE '+className+' SET '+updateFields+'WHERE id = ? ");'+ '\n'+
    '  stmt.run('+dataFields+', data.id);'+ '\n'+
    '  stmt.finalize();}'+ '\n'+ '\n';

    dbQueries +=
    dbName+".getAllFrom"+className+" = function(callback){"+ '\n'+
     'db.all("SELECT * FROM '+className+'", function(err, rows) {'+ '\n'+
     "if(err) {throw err;}"+ '\n'+
     "else { callback(null, rows);}"+ '\n'+
     "});}"+ '\n'+ '\n';

     dbQueries +=
     dbName+".getOneFrom"+className+" = function(id,callback){" +'\n'+
     '  stmt = db.prepare("SELECT * FROM '+className+' WHERE id = ?");' +'\n'+
     '  stmt.bind(id); ' +'\n'+
     '  stmt.get(function(error, row){' +'\n'+
     '    if(error) { throw err; }' +'\n'+
     '      else {' +'\n'+
     '          if(row)' +'\n'+
     '          { callback("", row); }' +'\n'+
     '          else' +'\n'+
     '          { callback("Record not found", null) }}' +'\n'+
     '  });}'+ '\n'+ '\n';

     dbQueries +=
     dbName+".deleteOneFrom"+className+" = function(id,callback){" +'\n'+
     '  stmt = db.prepare("DELETE FROM '+className+' WHERE id = ?");' +'\n'+
     '  stmt.bind(id);' +'\n'+
     '  stmt.get(function(error, row){' +'\n'+
     '    if(error) { throw err; } ' +'\n'+
     '    else { console.log("Record deleted"); }' +'\n'+
     '  });}'+ '\n'+ '\n';
  };

  return dbQueries;
}

function createRouterForTables(){
  const dbName = "SDB";

  var routerForTablesContent = 
	"var express = require('express');" + '\n' +
	"var router = express.Router();" + '\n' +
	"var "+dbName+" = require('../models/db');" + '\n' + '\n'+
	'router.get("/createTables", function(req, res){' + '\n';

	for ( var classRouteIndex = 0; classRouteIndex < erClasses.length; classRouteIndex++ ){
		routerForTablesContent +=
		"\t"+dbName+".createTable" + (classRouteIndex + 1) + "( function(error) {" + '\n' +
		"		console.log('Table " + erClasses[classRouteIndex].name.split(" ").join("_") + " created');" + '\n' + '\t';
	}
	routerForTablesContent += "						res.redirect('back');" +'\n';

	//This should be recursive instead of 2 fors
	for ( var classRouteIndex = 0; classRouteIndex < erClasses.length; classRouteIndex++ ){
		routerForTablesContent += "	});" + '\n';
	}
	routerForTablesContent += 
		"});" + '\n'+ '\n' +
		"module.exports = router;"+ '\n';
	createFile(routerForTablesContent, "render.js", '../routes/', "script" );

}