function createRoutes(){
  const dbName = "SDB";
  saveNav();
  //using JQuery's extend function to copy array value and not the reference
  var navNodes = $.extend(true, [], navDiagram.model.nodeDataArray),
      routes = "",
      pagesInRouting = [],
      listsInRouting = [];

  //Divide nodes by page or list
  for ( var nodeIndex = 0; nodeIndex < navNodes.length; nodeIndex++){
      if ( navNodes[nodeIndex].category == "MainPage" || navNodes[nodeIndex].category == "Page" ){
        pagesInRouting.push(navNodes[nodeIndex]);
      } else if ( navNodes[nodeIndex].category == "List"){
        listsInRouting.push(navNodes[nodeIndex]);
      }
  }// end divide nodes by page or list

  //Create routes per page
  for ( var pageToRouteI = 0; pageToRouteI < pagesInRouting.length; pageToRouteI++ ){
    var fileName = pagesInRouting[pageToRouteI].name.toLowerCase().split(" ").join("_");
    var listsInPage = [];
    var getLine = "router.get('/#{name}', function(req, res) {";

    if (pagesInRouting[pageToRouteI].category == "MainPage"){ // For MainPage we set the route to '/'
      getLine = "router.get('/', function (req, res) {";
    };

    //get lists within page
    for (var listIndex = 0; listIndex < listsInRouting.length; listIndex ++ ){
      if ( listsInRouting[listIndex].group == pagesInRouting[pageToRouteI].key ){
        listsInPage.push(listsInRouting[listIndex]);
      }
    }

    var routerTemplate = getLine + '\n';
    //if page contains list(s) this should get all the records in the table and send them to the template
    if (listsInPage.length > 0){
      var renderStmt = "  res.render('rendered/#{name}', { title: '#{pageName}', ";

      for (var lipIndex = 0; lipIndex < listsInPage.length; lipIndex ++){ // nesting calls to DB - THIS SHOULD BE RECURSIVE
        var listClassName = listsInPage[lipIndex].class.split(" ").join("_");
        routerTemplate += 
        "  #{dbName}.getAllFrom"+listClassName+"(function(error, recordsFrom"+listClassName+"){" + '\n'+ '  '; 
        renderStmt += "  recordsFrom"+listClassName+" : recordsFrom"+listClassName+", ";
      }
      //Remove last comma from renderStmt
      var iLastComma = renderStmt.lastIndexOf(',');
      renderStmt = renderStmt.slice(0, iLastComma) + renderStmt.slice(iLastComma).replace(',', '');
      routerTemplate +=  renderStmt + "  });" + '\n'; // adding render to page statement

      for (var lipIndex = 0; lipIndex < listsInPage.length; lipIndex ++){ // closing nested calls to DB - THIS SHOULD BE RECURSIVE
        routerTemplate += "  });" + '\n';
      } 

      //Replace variables
      var routerValues = { name: fileName, pageName: pagesInRouting[pageToRouteI].name, dbName:dbName };

    } else {
      routerTemplate += 
      "  res.render('rendered/#{name}', { title: '#{pageName}' });"+ '\n';
      var routerValues = { name: fileName, pageName: pagesInRouting[pageToRouteI].name };
    }
    routerTemplate += "});"+ '\n'+ '\n';//Closing get function
    var route = $.tmpl(routerTemplate, routerValues);
    routes += route;
  }// end for create routes per page

  var createTablesRouteTemp = 
    'router.get("/createTables", function(req, res){'+ '\n' +
    " #{dbName}.createTables();"+ '\n' +
    " res.end();"+ '\n' +
    "});"+ '\n'+ '\n';
  var createTablesRouteVals = { dbName: dbName };
  var createTablesRoutes = $.tmpl(createTablesRouteTemp, createTablesRouteVals);
  routes += createTablesRoutes;

  //Routers for CRUDs
  if (erClasses.length > 0) {
    for ( var crudRouteIndex = 0; crudRouteIndex < erClasses.length; crudRouteIndex++ ){
      var iLastComma = 0;
      var className = erClasses[crudRouteIndex].name.split(" ").join("_");

      routes +=
      'router.post("/insertOneIn'+className+'", function(req, res){'+ '\n'+
      '  '+dbName+'.insertOneIn'+className+'( req.body );'+ '\n'+
      "  res.redirect('back');"+ '\n'+
      '});'+ '\n'+ '\n';

      routes +=
      'router.get("/updateOneIn'+className+'/:id", function(req, res){'+ '\n'+
      '  '+dbName+'.getOneFrom'+className+'( req.params.id, function(error, data){'+ '\n'+
      '    if(error == ""){ res.render("rendered/formUpdateOneIn'+className+'", { title: "Update in '+erClasses[crudRouteIndex].name+'", record : data });}'+ '\n'+
      '    else { console.log(error); res.redirect("back"); }'+ '\n'+
      '  });'+ '\n'+
      '});'+ '\n'+ '\n';

      routes +=
      'router.post("/updateOneIn'+className+'", function(req, res){'+ '\n'+
      '  '+dbName+'.updateOneIn'+className+'( req.body );'+ '\n'+
      "  res.redirect('back');"+ '\n'+
      '});'+ '\n'+ '\n';

      routes +=
      'router.get("/deleteOneFrom'+className+'/:id", function(req, res){'+ '\n'+
      '  '+dbName+'.deleteOneFrom'+className+'( req.params.id );'+ '\n'+
      "  res.redirect('back');"+ '\n'+
      '});'+ '\n'+ '\n';

      routes +=
      'router.get("/detailOfOneFrom'+className+'/:id", function(req, res){'+ '\n'+
      '  '+dbName+'.getOneFrom'+className+'( req.params.id, function(error, data) {'+ '\n'+
      '    res.render("rendered/detailFrom'+className+'", { title: "Detail of record from '+erClasses[crudRouteIndex].name+'", record : data });'+ '\n'+
      '  });'+ '\n'+
      '});'+ '\n'+ '\n';

    }
  }

  //Create render.js file which contains routes to the new files and gateways 
  var routerContentTemplate = 
  "var express = require('express');" + '\n' +
  "var router = express.Router();" + '\n' +
  "var #{dbName} = require('../models/db');" + '\n' +
  "//below autogenerated routes" + '\n' +
  "#{routes}"+ '\n' +
  "module.exports = router;"+ '\n';

  var routerContentValues = { routes: routes, dbName: dbName };
  var routerContent = $.tmpl(routerContentTemplate, routerContentValues);
  //call function to create router for render
  createFile(routerContent, "render.js", '../routes/', "script" );

  $('#PagesButton').prop('disabled', false); //Enable step 2
}// end function createRoutes()