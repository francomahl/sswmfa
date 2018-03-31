//erClasses has the saved classes in erDiagram
var erClasses = [];

//---------------------------- Context Menu functions
// This is the general menu command handler, parameterized by the name of the command.
function cxcommand(classKey, val) {
  if (val === undefined) val = event.currentTarget.id;
  var diagram = navDiagram;

  for (i = 0; i < erClasses.length; i++) {
    if(erClasses[i].key == classKey) {
      loadClassForm(diagram, erClasses[i]);
      break;
    }
  }

  diagram.currentTool.stopTool();
}

// A custom command, for changing the color of the selected node(s).
function loadClassForm(diagram, erClass) {
  // Always make changes in a transaction, except when initializing the diagram.
  diagram.startTransaction("add fields");
  diagram.selection.each(function(node) {
    if (node instanceof go.Node) {  // ignore any selected Links and simple Parts
        // Examine and modify the data, not the Node directly.
        var data = node.data;
        var fields = data.fields;
        //Clear fields
        var flen = fields.length;
        for (i=1; i <= flen; i++){ diagram.model.removeArrayItem(fields, 0); }
        //Update form name
        diagram.model.setDataProperty(data, "class", erClass.name);
        //Load fields from class' properties
        for (i=0; i < erClass.properties.length; i++){
          diagram.model.addArrayItem(fields, {
            name: erClass.properties[i].name, 
            type: erClass.properties[i].type, 
            unique: erClass.properties[i].unique,
            nullable: erClass.properties[i].nullable,
            display: true
          })
        }
    }
  });
  diagram.commitTransaction("add fields");
}

function updateContextMenu(){
  var len = erClasses.length;
  $('#classes').empty();
  $('#classes').append("<li id='notFound'> No classes found </li>");

  if(len > 0){
    for (i = 0; i < len; i++) {
      $('#classes').append(
        "<li class = 'erClass' onclick='cxcommand(erClasses["+ i + "].key)'><a href='#' target='_self'>" +
        erClasses[i].name +
        "</a></li>");
    }
  }
}
//---------------------------- /Context Menu functions

// Show the diagram's model in JSON format that the user may edit
function saveNav() {
  saveNavDiagramProperties();  // do this first, before writing to JSON
  document.getElementById("mySavedNavModel").value = navDiagram.model.toJson();
  navDiagram.isModified = false;
}

function loadNav() {
  navDiagram.model = go.Model.fromJson(document.getElementById("mySavedNavModel").value);
  loadNavDiagramProperties();  // do this after the Model.modelData has been brought into memory
}

function saveNavDiagramProperties() {
  navDiagram.model.modelData.position = go.Point.stringify(navDiagram.position);
}

function loadNavDiagramProperties(e) {
  // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
  var pos = navDiagram.model.modelData.position;
  if (pos) navDiagram.initialPosition = go.Point.parse(pos);
}

function saveER() {
  saveERDiagramProperties();  // do this first, before writing to JSON
  document.getElementById("mySavedERModel").value = erDiagram.model.toJson();
  erDiagram.isModified = false;
  erClasses = $.extend(true, [], erDiagram.model.nodeDataArray); //using JQuery's extend function to copy array value and not the reference
  updateContextMenu();
}

function loadER() {
  erDiagram.model = go.Model.fromJson(document.getElementById("mySavedERModel").value);
  loadERDiagramProperties();  // do this after the Model.modelData has been brought into memory
}

function saveERDiagramProperties() {
  erDiagram.model.modelData.position = go.Point.stringify(erDiagram.position);
}

function loadERDiagramProperties(e) {
  // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
  var pos = erDiagram.model.modelData.position;
  if (pos) erDiagram.initialPosition = go.Point.parse(pos);
}

function createFile(fileContent, fileName, dir, dataType ){
  var data = {};
  data.fileContent = fileContent;
  data.fileName = fileName
  data.dir = dir

  $.ajax({
    type: 'POST',
    dataType: dataType,
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    url: 'http://localhost:3000/createFile',
    converters: {
      'text json': true
    },
    success: function(data) {
      console.log('success')
    }
  });
}