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
        diagram.model.setDataProperty(data, "name", "Form " + erClass.name);
        //Load fields from class' properties
        for (i=0; i < erClass.properties.length; i++){
          diagram.model.addArrayItem(fields, {name: erClass.properties[i].name , display: "yes"})}
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

// Functions for highlighting, called by updateHighlights.
// x in each case is the selected object or the object being treated as such.
// Some have return values for use by each other or for tooltips.

// If selected object is a link, highlight its fromNode.
// Otherwise highlight the fromNode of each link coming into the selected node.
// Return a List of the keys of the nodes.
function nodesTo(x, i) {
  var nodesToList = new go.List("string");
  if (x instanceof go.Link) {
    x.fromNode.highlight = i;
    nodesToList.add(x.data.from);
  } else {
    x.findNodesInto().each(function(node) {
      node.highlight = i;
      nodesToList.add(node.data.name);
    });
  }
  return nodesToList;
}

// same as nodesTo, but 'from' instead of 'to'
function nodesFrom(x, i) {
  var nodesFromList = new go.List("string");
  if (x instanceof go.Link) {
    x.toNode.highlight = i;
    nodesFromList.add(x.data.to);
  } else {
    x.findNodesOutOf().each(function(node) {
      node.highlight = i;
      nodesFromList.add(node.data.name);
    });
  }
  return nodesFromList;
}

// If x is a link, highlight its toNode, or if it is a node, the node(s) it links to,
// and then call nodesReach on the highlighted node(s), with the next color.
// Do not highlight any node that has already been highlit with a color
// indicating a closer relationship to the original node.

// highlights the group containing this object, specific method for links
// returns the containing group of x
function containing(x, i) {
  var container = x.containingGroup;
  if (container !== null) container.highlight = i;
  return container;
}

// if the Node"s containingGroup is x, highlight it
function childNodes(x, i) {
  var childLst = new go.List("string");
  if (x instanceof go.Group) {
    navDiagram.nodes.each(function(node) {
      if (node.containingGroup === x) {
        node.highlight = i;
        childLst.add(node.data.name);
      }
    });
  }
  return childLst;
}

// if the link"s containing Group is x, highlight it
function childLinks(x, i) {
  var childLst = new go.List(go.Link);
  navDiagram.links.each(function(link) {
    if (link.containingGroup === x) {
      link.highlight = i;
      childLst.add(link);
    }
  });
  return childLst;
}

// returns the text for a tooltip, param obj is the text itself
function getInfo(model, obj) {
  var x = obj.panel.adornedPart; // the object that the mouse is over
  var text = ""; // what will be displayed
  if (x instanceof go.Node) {
    if (x instanceof go.Group) text += "Group: "; else text += "Node: ";
    text += x.data.name;
    var toLst = nodesTo(x, 0); // display names of nodes going into this node
    if (toLst.count > 0) {
      toLst.sort(function(a, b) {return a<b ? -1 : 1});
      text += "\nNodes into: ";
      toLst.each(function(name) {
        if (name !== text.substring(text.length-3, text.length-2)) {
          text+= name + ", ";
        }
      });
      text = text.substring(0, text.length-2);
    }
    var frLst = nodesFrom(x, 0); // display names of nodes coming out of this node
    if (frLst.count > 0) {
      frLst.sort(function(a, b) {return a<b ? -1 : 1});
      text += "\nNodes out of: ";
      frLst.each(function(name) {
        if (name !== text.substring(text.length-3, text.length-2)) {
          text+= name + ", ";
        }
      });
      text = text.substring(0, text.length-2);
    }
    var grpC = containing(x, 0); // if the node is in a group, display its name
    if (grpC !== null) text += "\nContaining SubGraph: " + grpC.data.name;
    if (x instanceof go.Group) {
        // if it"s a group, also display nodes and links contained in it
      text += "\nMember nodes: ";
      var children = childNodes(x, 0);
      children.sort(function(a, b) {return a<b ? -1 : 1});
      children.each(function(name) {
        if (name !== text.substring(text.length-3, text.length-2)) {
          text += name + ", ";
        }
      });
      text = text.substring(0, text.length-2);

      var linkChildren = childLinks(x, 0);
      if (linkChildren.count > 0) {
        text += "\nMember links: ";
        var linkStrings = new go.List("string");
        linkChildren.each(function(link) {
          linkStrings.add(link.data.from + " --> " + link.data.to);
        });
        linkStrings.sort(function(a, b) {return a<b ? -1 : 1});
        linkStrings.each(function(str) {
          text += str + ", ";
        });
        text = text.substring(0, text.length-2);
      }
    }
  } else if (x instanceof go.Link) {
      // if it"s a link, display its to and from nodes
    text += "Link: " + x.data.from + " --> " + x.data.to +
      "\nNode To: " + x.data.to + "\nNode From: " + x.data.from;
    var grp = containing(x, 0); // and containing group, if it has one
    if (grp !== null) text += "\nContaining SubGraph: " + grp.data.name;
  }
  return text;
}

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