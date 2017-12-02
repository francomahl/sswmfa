function initNavM() {
  var GO = go.GraphObject.make;  // for conciseness in defining templates
    // a collection of colors
  var colors = {
    blue:   "#00B5CB",
    orange: "#F47321",
    green:  "#C8DA2B",
    gray:   "#888",
    white:  "#F5F5F5"
  };

  navDiagram =
    GO(go.Diagram, "navDiagramDiv",  // Diagram refers to its DIV HTML element by id
      {
        initialContentAlignment: go.Spot.Center,
        maxSelectionCount: 1, // no more than 1 element can be selected at a time
        grid: GO(go.Panel, "Grid",
                GO(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                GO(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
                GO(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
                GO(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
              ),
        allowDrop: true,  // must be true to accept drops from the Palette
        // what to do when a drag-drop occurs in the Diagram's background
        mouseDrop: function(e) { finishDrop(e, null); },
        "commandHandler.archetypeGroupData": { isGroup: true, category: "OfNodes" },
        "draggingTool.dragsLink": true,
        "draggingTool.isGridSnapEnabled": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.portGravity": 20,
        "linkReshapingTool.handleArchetype":
          GO(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        "undoManager.isEnabled": true
      });
// There are two templates for Groups, "OfGroups" and "OfNodes".

// this function is used to highlight a Group that the selection may be dropped into
function highlightGroup(e, grp, show) {
  if (!grp) return;
  e.handled = true;
  if (show) {
    // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
    // instead depend on the DraggingTool.draggedParts or .copiedParts
    var tool = grp.diagram.toolManager.draggingTool;
    var map = tool.draggedParts || tool.copiedParts;  // this is a Map
    // now we can check to see if the Group will accept membership of the dragged Parts
    if (grp.canAddMembers(map.toKeySet())) {
      grp.isHighlighted = true;
      return;
    }
  }
  grp.isHighlighted = false;
}

// Upon a drop onto a Group, we try to add the selection as members of the Group.
// Upon a drop onto the background, or onto a top-level Node, make selection top-level.
// If this is OK, we're done; otherwise we cancel the operation to rollback everything.
function finishDrop(e, grp) {
  var ok = (grp !== null
            ? grp.addMembers(grp.diagram.selection, true)
            : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
  if (!ok) e.diagram.currentTool.doCancel();
}

navDiagram.groupTemplateMap.add("OfGroups",
  GO(go.Group, "Auto",
    { resizable: true,
      background: "transparent",
      // highlight when dragging into the Group
      mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
      mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
      computesBoundsAfterDrag: true,
      // when the selection is dropped into a Group, add the selected Parts into that Group;
      // if it fails, cancel the tool, rolling back any changes
      mouseDrop: finishDrop,
      handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
      // Groups containing Groups lay out their members horizontally
      layout:
        GO(go.GridLayout,
          { wrappingWidth: Infinity, alignment: go.GridLayout.Position,
              cellSize: new go.Size(50, 50), spacing: new go.Size(24, 24) })
    },
    new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
    GO(go.Shape, "Rectangle",
      { fill: "#455983", stroke: "#455983", strokeWidth: 2 }),
    GO(go.Panel, "Vertical",  // title above Placeholder
      GO(go.Panel, "Horizontal",  // button next to TextBlock
        { stretch: go.GraphObject.Horizontal, background: "#455983" },
        GO("SubGraphExpanderButton",
          { alignment: go.Spot.Right, margin: 5 }),
        GO(go.TextBlock,
          {
            alignment: go.Spot.Left,
            editable: true,
            margin: 5,
            font: "bold 18px sans-serif",
            opacity: 0.75,
            stroke: "white"
          },
          new go.Binding("text", "key").makeTwoWay())
      ),  // end Horizontal Panel
      GO(go.Placeholder,
        { padding: 16, alignment: go.Spot.TopLeft })
    )  // end Vertical Panel
  ));  // end Group and call to add to template Map

navDiagram.groupTemplateMap.add("OfNodes",
  GO(go.Group, "Auto",
    { resizable: true,
      background: "transparent",
      ungroupable: true,
      // highlight when dragging into the Group
      mouseDragEnter: function(e, grp, prev) { highlightGroup(e, grp, true); },
      mouseDragLeave: function(e, grp, next) { highlightGroup(e, grp, false); },
      computesBoundsAfterDrag: true,
      // when the selection is dropped into a Group, add the selected Parts into that Group;
      // if it fails, cancel the tool, rolling back any changes
      mouseDrop: finishDrop,
      handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
      // Groups containing Nodes lay out their members vertically
      layout:
        GO(go.GridLayout,
          { wrappingColumn: 1, alignment: go.GridLayout.Position,
              cellSize: new go.Size(50, 50), spacing: new go.Size(20, 20) })
    },
    new go.Binding("background", "isHighlighted", function(h) { return h ? "rgba(255,0,0,0.2)" : "transparent"; }).ofObject(),
    GO(go.Shape, "Rectangle",
      { fill: "#EAE6E6", stroke: "#EAE6E6", strokeWidth: 2 }),
    GO(go.Panel, "Vertical",  // title above Placeholder
      { portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
        // allow all kinds of links from and to this port
        fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
        toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
      },
      GO(go.Panel, "Horizontal",  // button next to TextBlock
        { stretch: go.GraphObject.Horizontal, background: "#EAE6E6" },
        GO("SubGraphExpanderButton",
          { alignment: go.Spot.Right, margin: 5 }),
        GO(go.TextBlock,
          {
            alignment: go.Spot.Left,
            editable: true,
            margin: 5,
            font: "bold 16px sans-serif",
            opacity: 0.75,
            stroke: "#404040"
          },
          new go.Binding("text", "key").makeTwoWay())
      ),  // end Horizontal Panel
      GO(go.Placeholder,
        { padding: 16, alignment: go.Spot.TopLeft })
    )  // end Vertical Panel
  ));  // end Group and call to add to template Map

  // define the node template
  navDiagram.nodeTemplate =
    GO(go.Node, "Spot",
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides,
        // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
        mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); }
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      {   locationSpot: go.Spot.Center,
          toEndSegmentLength: 30, fromEndSegmentLength: 30
      },
      GO(go.Panel, "Auto",
          { width: 100, height: 120 },
          GO(go.Shape,
            {
              name: "OBJSHAPE",
              fill: "white",
//              desiredSize: new go.Size(100, 40),
              portId: "", // the default port: if no spot on link data, use closest side
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              strokeWidth: 4,
              stroke: colors["gray"]
            },
            new go.Binding("fill", "color").makeTwoWay(),
            new go.Binding("figure", "fig").makeTwoWay()),
          GO(go.Panel, "Table",
            GO(go.TextBlock,
              {
                row: 0,
                margin: 3,
//                    maxSize: new go.Size(80, NaN),
                stroke: "white",
                font: "bold 11pt sans-serif",
                isMultiline: false,
                editable: true
              },
              new go.Binding("text", "key").makeTwoWay()),
            GO(go.Picture,
              { row: 1, width: 55, height: 55 },
              new go.Binding("source", "icon").makeTwoWay()),
            GO(go.TextBlock,
              {
                row: 2,
                margin: 3,
                editable: true,
//                    maxSize: new go.Size(80, 40),
                stroke: "white",
                font: "bold 9pt sans-serif"
              },
              new go.Binding("text", "name").makeTwoWay())
          )
      ),
      {
        toolTip:  //  define a tooltip for each node that displays its information
          GO(go.Adornment, "Auto",
            GO(go.Shape, { fill: "#EFEFCC" }),
            GO(go.TextBlock, { margin: 4 },
              new go.Binding("text",  "" , getInfo))
          )
      }
    );

  // On selection changed, make sure infoDraggable will resize as necessary
  navDiagram.addDiagramListener("ChangedSelection", function(diagramEvent) {
    var idrag = document.getElementById("infoDraggable");
    idrag.style.width = "";
    idrag.style.height = "";
  });

  // define the link template
  navDiagram.linkTemplate =
    GO(go.Link,
      {
        selectionAdornmentTemplate:
          GO(go.Adornment,
            GO(go.Shape,
              { isPanelMain: true, stroke: "dodgerblue", strokeWidth: 3 }),
            GO(go.Shape,
              { toArrow: "Standard", fill: "dodgerblue", stroke: null, scale: 1 })
          ),
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        routing: go.Link.AvoidsNodes,
        toShortLength: 2
      },
      GO(go.Shape,  //  the link shape
        { name: "OBJSHAPE" }),
      GO(go.Shape,  //  the arrowhead
        { name: "ARWSHAPE", toArrow: "Standard" }),
      GO(go.TextBlock, "text",
        { segmentOffset: new go.Point(0, -10),
          segmentOrientation: go.Link.OrientUpright,
          editable: true
        }),
      {
        toolTip:  //  define a tooltip for each link that displays its information
          GO(go.Adornment, "Auto",
            GO(go.Shape, { fill: "#EFEFCC" }),
            GO(go.TextBlock, { margin: 4 },
              new go.Binding("text",  "" , getInfo))
          )
      }
    );

  // add nodes, including groups, and links to the model
  navDiagram.model = new go.GraphLinksModel(
  [ // node data
    { key: "A", icon:"../gojs/samples/images/openFolder.png", name:"unNombre", color: colors["blue"], fig: "Hexagon", group: "Master Page", loc: new go.Point(320, 100) },
    { key: "B", icon:"../gojs/samples/images/55x55.png", name:"unNombre", color: colors["orange"], fig: "RoundRectangle", group: "Master Page", loc: new go.Point(420, 200) },
    { key: "D", icon:"../gojs/samples/images/55x55.png", name:"unNombre", color: colors["orange"], fig: "RoundRectangle", group: "Home Page", loc: new go.Point(270, 325) },
    { key: "F", icon:"../gojs/samples/images/55x55.png", name:"unNombre", color: colors["blue"], fig: "Hexagon", group: "Home Page", loc: new go.Point(200, 350) },
    { key: "G", icon:"../gojs/samples/images/55x55.png", name:"unNombre", color: colors["orange"], fig: "RoundRectangle", group: "Home Page", loc: new go.Point(180, 450) },
    { key: "H", icon:"../gojs/samples/images/55x55.png", name:"unNombre", color: colors["blue"], fig: "Hexagon", loc: new go.Point(180, 450) },
    { key: "Master Page", isGroup: true, category:"OfNodes" },
    { key: "Main content", isGroup: true, category:"OfGroups"  },
    { key: "Home Page", isGroup: true, category:"OfNodes", group: "Main content" }
  ],
  [  // link data
    { from: "A", to: "B" },
    { from: "A", to: "H" },
    { from: "D", to: "F" },
    { from: "F", to: "G" }
  ]);

  navDiagram.select(navDiagram.findNodeForKey('C'));

// initialize the Palette that is on the left side of the page
navPalette =
  GO(go.Palette, "navPaletteDiv",  // must name or refer to the DIV HTML element
    {
      maxSelectionCount: 1,
      nodeTemplateMap: navDiagram.nodeTemplateMap,  // share the templates used by navDiagram
      groupTemplateMap: navDiagram.groupTemplateMap,
      layout: GO(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position }),
      model: new go.GraphLinksModel([  // specify the contents of the Palette
        { key: "Action", fig: "Hexagon", color: colors["blue"] },
        { key: "Module", fig: "RoundRectangle", color: colors["orange"] },
        { key: "New Group", isGroup: true, category:"OfNodes" }
      ])
    });
$(function() {
    $("#infoDraggable").draggable({ handle: "#infoDraggableHandle" });

    var inspector = new Inspector('myInfo', navDiagram,
      {
        properties: {
          // key would be automatically added for nodes, but we want to declare it read-only also:
          "key": { show: Inspector.showIfPresent },
          // fill and stroke would be automatically added for nodes, but we want to declare it a color also:
          "fill": { show: Inspector.showIfPresent, type: 'color' },
          "stroke": { show: Inspector.showIfPresent, type: 'color' }
        }
      });
    });
}


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
      nodesToList.add(node.data.key);
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
      nodesFromList.add(node.data.key);
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
        childLst.add(node.data.key);
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
    text += x.data.key;
    var toLst = nodesTo(x, 0); // display names of nodes going into this node
    if (toLst.count > 0) {
      toLst.sort(function(a, b) {return a<b ? -1 : 1});
      text += "\nNodes into: ";
      toLst.each(function(key) {
        if (key !== text.substring(text.length-3, text.length-2)) {
          text+= key + ", ";
        }
      });
      text = text.substring(0, text.length-2);
    }
    var frLst = nodesFrom(x, 0); // display names of nodes coming out of this node
    if (frLst.count > 0) {
      frLst.sort(function(a, b) {return a<b ? -1 : 1});
      text += "\nNodes out of: ";
      frLst.each(function(key) {
        if (key !== text.substring(text.length-3, text.length-2)) {
          text+= key + ", ";
        }
      });
      text = text.substring(0, text.length-2);
    }
    var grpC = containing(x, 0); // if the node is in a group, display its name
    if (grpC !== null) text += "\nContaining SubGraph: " + grpC.data.key;
    if (x instanceof go.Group) {
        // if it"s a group, also display nodes and links contained in it
      text += "\nMember nodes: ";
      var children = childNodes(x, 0);
      children.sort(function(a, b) {return a<b ? -1 : 1});
      children.each(function(key) {
        if (key !== text.substring(text.length-3, text.length-2)) {
          text += key + ", ";
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
    if (grp !== null) text += "\nContaining SubGraph: " + grp.data.key;
  }
  return text;
}
// Show the diagram's model in JSON format that the user may edit
function save() {
  saveDiagramProperties();  // do this first, before writing to JSON
  document.getElementById("mySavedModel").value = navDiagram.model.toJson();
  navDiagram.isModified = false;
}
function load() {
  navDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
  loadDiagramProperties();  // do this after the Model.modelData has been brought into memory
}

function saveDiagramProperties() {
  navDiagram.model.modelData.position = go.Point.stringify(navDiagram.position);
}
function loadDiagramProperties(e) {
  // set Diagram.initialPosition, not Diagram.position, to handle initialization side-effects
  var pos = navDiagram.model.modelData.position;
  if (pos) navDiagram.initialPosition = go.Point.parse(pos);
}