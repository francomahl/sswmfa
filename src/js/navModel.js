function initNav() {
  var GO = go.GraphObject.make;  // for conciseness in defining templates

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
      "commandHandler.archetypeGroupData": { isGroup: true, category: "Page" },
      "draggingTool.dragsLink": true,
      "draggingTool.isGridSnapEnabled": true,
      "linkingTool.portGravity": 20,
      "relinkingTool.portGravity": 20,
      "linkReshapingTool.handleArchetype":
        GO(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
      "undoManager.isEnabled": true
    });

  // when the document is modified, add a "*" to the "Save" button
  navDiagram.addDiagramListener("Modified", function(e) {
      var button = $("#SaveNavButton");
      if (button) button.disabled = !navDiagram.isModified;
      if (navDiagram.isModified) {
          button.text('Save*');
      } else {
          button.text('Save');
      }
  });

  var nodeSelectionAdornmentTemplate = //Adornment for node selection: deepsky blue stroke
    GO(go.Adornment, "Auto",
      GO(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
      GO(go.Placeholder)
    );

  //-------------------- Context Menu (right click on a node)
  // This is the actual HTML context menu:
  var cxElement = document.getElementById("contextMenu");

  // Since we have only one main element, we don't have to declare a hide method,
  // we can set mainElement and GoJS will hide it automatically
  var myContextMenu = GO(go.HTMLInfo, {
    show: showContextMenu,
    mainElement: cxElement
  });
  //-------------------- /Context Menu

    // There are two templates for Groups, "Group" and "Page".

    // Upon a drop onto a Group, we try to add the selection as members of the Group.
    // Upon a drop onto the background, or onto a top-level Node, make selection top-level.
    // If this is OK, we're done; otherwise we cancel the operation to rollback everything.
  function finishDrop(e, grp) {
    var ok = (grp !== null
          ? grp.addMembers(grp.diagram.selection, true)
          : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
    if (!ok) e.diagram.currentTool.doCancel();
  }

  function commonGroupPanels() {
    return [
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
              stroke: "black"
            },
            new go.Binding("text", "name").makeTwoWay())
        ),  // end Horizontal Panel
        GO(go.Placeholder,
          { padding: 16, alignment: go.Spot.TopLeft })
      )  // end Vertical Panel
    ];
  };

  //Group of nodes - Main Page - This will exist always. No copiable, no deletable
  navDiagram.groupTemplateMap.add("MainPage",
    GO(go.Group, "Auto",
      { background: "transparent",
        ungroupable: true,
        computesBoundsAfterDrag: true,
        copyable: false,
        deletable: false,
        // when the selection is dropped into a Group, add the selected Parts into that Group;
        // if it fails, cancel the tool, rolling back any changes
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true  // don't need to define handlers on member Nodes and Links
      },
      commonGroupPanels(),
    ));  // end Group and call to add to template Map

  //Group of nodes - Page
  navDiagram.groupTemplateMap.add("Page",
    GO(go.Group, "Auto",
      { background: "transparent",
        ungroupable: true,
        computesBoundsAfterDrag: true,
        // when the selection is dropped into a Group, add the selected Parts into that Group;
        // if it fails, cancel the tool, rolling back any changes
        mouseDrop: finishDrop,
        handlesDragDropForMembers: true  // don't need to define handlers on member Nodes and Links
      },
      commonGroupPanels(),
    ));  // end Group and call to add to template Map

  var fieldTemplate =
    GO(go.Panel, "Horizontal",
      GO(go.Panel, "Table",
        GO(go.TextBlock,
          { column: 0, isMultiline: false, editable: false, font: "bold 10pt sans-serif" },
          new go.Binding("text", "name").makeTwoWay()),
        GO(go.TextBlock,
          { column: 1, visible: false },
          new go.Binding("text", "type").makeTwoWay()),
        // property display
        GO("CheckBox", "display",
          { column: 2, defaultAlignment: go.Spot.Right, "ButtonIcon.stroke": "green" },
        )
      )
    );

  function commonNodeStyle() {
    return [
    {
      contextMenu: myContextMenu,
      locationSpot: go.Spot.Center,
      fromSpot: go.Spot.AllSides,
      toSpot: go.Spot.AllSides,
      // dropping on a Node is the same as dropping on its containing Group, even if it's top-level
      mouseDrop: function(e, nod) { finishDrop(e, nod.containingGroup); }
    },
    GO(go.Shape,
        {
          portId: "", // the default port: if no spot on link data, use closest side
          fromLinkable: true, toLinkable: true, cursor: "pointer",
          fill: "white",  // default color
          strokeWidth: 2
        }),
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    { selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },];
  }

  function commonNodePanels() {
    return[
      { defaultRowSeparatorStroke: "black"},
      // header
      GO(go.TextBlock,
        {
          row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
          font: "bold 12pt sans-serif",
          isMultiline: false, editable: true
        },
//        new go.Binding("text", "key").makeTwoWay(),
        new go.Binding("text", "name").makeTwoWay()),
      // fields
      GO(go.Panel, "Horizontal",
        {
          row: 1, margin: 3,
          defaultAlignment: go.Spot.Center
        },
        GO(go.TextBlock,  // Shows the class is related to
            { font: "bold 8pt sans-serif",
              editable: false},
            new go.Binding("text","class").makeTwoWay())
      ),
      GO(go.Panel, "Vertical",
       new go.Binding("itemArray", "fields"),
        {
          row: 2, margin: 3, stretch: go.GraphObject.Fill,
          defaultAlignment: go.Spot.Left,
          itemTemplate: fieldTemplate
        }
      ),
    ]
  }

  // Node Form
  navDiagram.nodeTemplateMap.add("Form",
  GO(go.Node, "Auto",commonNodeStyle(),
    GO(go.Panel, "Table",
      commonNodePanels(),
      GO(go.TextBlock,
        { isMultiline: true, visible: false },
        new go.Binding("text","comments").makeTwoWay()
      )
    )
  ));

  // Node List
  navDiagram.nodeTemplateMap.add("List",
  GO(go.Node, "Auto", commonNodeStyle(),
    GO(go.Panel, "Table",
      commonNodePanels(),
      GO(go.TextBlock,
        { visible: false },
        new go.Binding("text","comments").makeTwoWay()
      ),
      GO(go.TextBlock,
        { isMultiline: true, visible: false },
        new go.Binding("text","type").makeTwoWay()
      )
    )
  ));

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
      new go.Binding("points").makeTwoWay(),
      GO(go.Shape,  //  the link shape
        { name: "OBJSHAPE" }),
      GO(go.Shape,  //  the arrowhead
        { name: "ARWSHAPE", toArrow: "Standard" }),
      GO(go.TextBlock, "text",
        { segmentOffset: new go.Point(0, -10),
          segmentOrientation: go.Link.OrientUpright,
          editable: true
        },
        new go.Binding("text","details").makeTwoWay()
      )
    );

    // initialize the Palette that is on the left side of the page
  navPalette =
    GO(go.Palette, "navPaletteDiv",  // must name or refer to the DIV HTML element
      {
        maxSelectionCount: 1,
        nodeTemplateMap: navDiagram.nodeTemplateMap,  // share the templates used by navDiagram
        groupTemplateMap: navDiagram.groupTemplateMap,
        layout: GO(go.GridLayout, { wrappingColumn: 1, alignment: go.GridLayout.Position }),
        model: new go.GraphLinksModel([  // specify the contents of the Palette
          { category: "Form", name: "Form", class: "No Class selected", fields: [{ name: "field1", type: "dataType", display: true }], comments: ""},
          { category: "List", name: "Simple List", class: "No Class selected", fields: [{ name: "field1", type: "dataType", display: true }], type:"Simple List", comments: ""},
          { category: "List", name: "List", class: "No Class selected", fields: [{ name: "field1", type: "dataType", display: true }], type:"List", comments: ""},
          { category: "List", name: "Checkeable List", class: "No Class selected", fields: [{ name: "field1", type: "dataType", display: true }], type:"Checkeable List", comments: ""},
          { name: "Page", isGroup: true, category:"Page" }
        ])
      });

  //Updates information into div infoDraggable when a Node is selected
  $(function() {
      $("#infoDraggable").draggable({ handle: "#infoDraggableHandle" });
      var inspector = new Inspector('myInfo', navDiagram,
        {
          includesOwnProperties: false,
          properties: {
            // Nodes properties
            "key": { readOnly: true, show: Inspector.showIfPresent },
            "name": { readOnly: true, show: Inspector.showIfPresent },
            "category": { readOnly: true, show: Inspector.showIfPresent },
            "type": { readOnly: true, show: Inspector.showIfPresent },
            "comments": { show: Inspector.showIfPresent },
            // Links properties
            "from": { readOnly: true, show: Inspector.showIfPresent },
            "to": { readOnly: true, show: Inspector.showIfPresent },
            "details": { show: Inspector.showIfPresent }
          }
        });
      });

// setup a main page
  var nodedata = [
    { name: "Main Page", isGroup: true, category:"MainPage" }];

  navDiagram.model = GO(go.GraphLinksModel,
    {
      copiesArrays: true,
      copiesArrayObjects: true,
      nodeDataArray: nodedata
    });

  //-------------------- Context Menu
  navDiagram.contextMenu = myContextMenu;

  // We don't want the div acting as a context menu to have a (browser) context menu!
  cxElement.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    return false;
  }, false);

  function showContextMenu(obj, diagram, tool) {
    // Show only the relevant buttons given the current state.
    var cmd = diagram.commandHandler;
    document.getElementById("notFound").style.display = (erClasses.length == 0) ? "block" : "none";
    $(".erClass").css("display","block");
    // Now show the whole context menu element
    cxElement.style.display = "block";
    // we don't bother overriding positionContextMenu, we just do it here:
    var mousePt = diagram.lastInput.viewPoint;
    cxElement.style.left = mousePt.x + "px";
    cxElement.style.top = mousePt.y + "px";
  }
  //-------------------- /Context Menu
};