function createRoutes(){
  saveNav();
  //using JQuery's extend function to copy array value and not the reference
  let navNodes = $.extend(true, [], navDiagram.model.nodeDataArray),
      routes = "",
      pagesInRouting = [],
      listsInRouting = [];

  //Divide nodes by page or list
  navNodes.forEach(function (navNode, index){
    if ( navNode.category === "MainPage" || navNode.category === "Page" ){
      pagesInRouting.push(navNode);
    } else if ( navNode.category === "List"){
      listsInRouting.push(navNode);
    }
  });// end divide nodes by page or list

  //Create routes per page
  pagesInRouting.forEach(function (pageInRouting, pageToRouteI){
    const fileName = pageInRouting.name.toLowerCase().split(" ").join("_");
    let listsInPage = [];
    let getLine = "router.get('/#{name}', function(req, res) {";

    if (pageInRouting.category === "MainPage"){ // For MainPage we set the route to '/'
      getLine = "router.get('/', function (req, res) {";
    };

    //get lists within page
    listsInRouting.forEach(function (listInRouting, listIndex){
      if ( listInRouting.group === pageInRouting.key ){
        listsInPage.push(listInRouting);
      }
    });// end for each list in routing

    let routerTemplate = getLine + '\n';
    //if page contains list(s) this should get all the records in the table and send them to the template
    if (listsInPage.length > 0){
      let renderStmt = "  res.render('rendered/#{name}', { title: '#{pageName}', ";
      listsInPage.forEach(function (listInPage, lipIndex){// nesting calls to DB - THIS SHOULD BE RECURSIVE
        const listClassName = listInPage.class.split(" ").join("_");
        routerTemplate += 
        `  sequelize.models.${listClassName}.findAll().then(recordsFrom${listClassName} => {` + '\n'+ ' ';
        renderStmt += `  recordsFrom${listClassName} : recordsFrom${listClassName}`;
        renderStmt += ((lipIndex+1 === listsInPage.length) ? ' });' : ', ');
      });// end for each list in page
      routerTemplate += renderStmt + '\n';
      for (let lipIndex = 0; lipIndex < listsInPage.length; lipIndex ++){ // closing nested calls to DB - THIS SHOULD BE RECURSIVE
        routerTemplate += "  });" + '\n';
      };// end for

    } else {
      routerTemplate += 
      "  res.render('rendered/#{name}', { title: '#{pageName}' });"+ '\n';
    }
    //Replace variables
    const routerValues = { name: fileName, pageName: pageInRouting.name };
    routerTemplate += "});"+ '\n'+ '\n';//Closing get function
    const route = $.tmpl(routerTemplate, routerValues);
    routes += route;
  });// end for create routes per page

  //Routers for CRUDs
  erClasses.forEach(function (erClass, crudRouteIndex){
    const className = erClass.name.split(" ").join("_");

    //----------create
    routes +=
    `router.post("/insertOneIn${className}", function(req, res){`+ '\n'+
    `  sequelize.models.${className}.create({`+ '\n';
    erClass.properties.forEach(function (property, index){
      const fieldName = property.name.split(" ").join("_");
      routes +=
      `    ${fieldName}: req.body.${fieldName}`;
      routes += ((index+1===erClass.properties.length) ? '' : ',');
      routes += '\n';
    });// end for each property
    routes +=
    "  })"+ '\n' +
    "  .then(()=> {res.redirect('back')})"+ '\n' +
    "  .catch(error => {console.log(error);res.redirect('back')});"+ '\n' +
    "});"+ '\n' + '\n';

    //----------update
    routes +=
    `router.get("/updateOneIn${className}/:id", function(req, res){`+ '\n'+
    `  sequelize.models.${className}.findById(req.params.id).then(record => {` + '\n'+
    `    res.render("rendered/formUpdateOneIn${className}", { title: "Update in ${className}", record : record })` + '\n'+
    `  });` + '\n'+
    `});` + '\n' + '\n';

    routes +=
    `router.post("/updateOneIn${className}", function(req, res){` + '\n'+
    `  sequelize.models.${className}.findById(req.body.id).then(record => {` + '\n';
    erClass.properties.forEach(function (property, index){
      const fieldName = property.name.split(" ").join("_");
      routes +=
      `    record.${fieldName} = req.body.${fieldName};` + '\n';
    });// end for each property
    
    routes +=
    '    record.save()' + '\n'+
    `    .then(()=> {res.render("rendered/formUpdateOneIn${className}", { title: "Update in ${className}", record : record })})` + '\n'+
    "    .catch(error => {console.log(error);res.redirect('back')});" + '\n'+
    '  });' + '\n'+
    '});' + '\n' + '\n';

    //----------delete
    routes +=
    `router.get("/deleteOneFrom${className}/:id", function(req, res){` + '\n'+
    `  sequelize.models.${className}.findById(req.params.id).then(record => {` + '\n'+
    "    record.destroy().then(()=> {res.redirect('back')})" + '\n'+
    '  });' + '\n'+
    '});' + '\n' + '\n';

    //----------detail
    routes +=
    `router.get("/detailOfOneFrom${className}/:id", function(req, res){` + '\n'+
    `  sequelize.models.${className}.findById(req.params.id).then(record => {` + '\n'+
    `    res.render("rendered/detailFrom${className}", { title: "Detail of record from ${className}", record : record });` + '\n'+
    '  });' + '\n'+
    '});' + '\n' + '\n';
  })//end for each erClasses

  //Create render.js file which contains routes to the new files and gateways 
  var routerContentTemplate = 
  "var express = require('express');" + '\n' +
  "var router = express.Router();" + '\n' +
  "var sequelize = require('../models/db');" + '\n' +
  "//below autogenerated routes" + '\n' +
  "#{routes}"+ '\n' +
  "module.exports = router;"+ '\n';

  var routerContentValues = { routes: routes };
  var routerContent = $.tmpl(routerContentTemplate, routerContentValues);
  //call function to create router for render
  createFile(routerContent, "render.js", '../routes/', "script" );

  $('#PagesButton').prop('disabled', false); //Enable step 2
}// end function createRoutes()