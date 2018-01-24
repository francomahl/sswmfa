function initER() {
  var GO = go.GraphObject.make;  // for conciseness in defining templates

  erDiagram =
    GO(go.Diagram, "erDiagramDiv",  // must name or refer to the DIV HTML element
      {
        grid: GO(go.Panel, "Grid",
                GO(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5 }),
                GO(go.Shape, "LineH", { stroke: "gray", strokeWidth: 0.5, interval: 10 }),
                GO(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5 }),
                GO(go.Shape, "LineV", { stroke: "gray", strokeWidth: 0.5, interval: 10 })
              ),
        allowDrop: true,  // must be true to accept drops from the Palette
        "draggingTool.dragsLink": true,
        "draggingTool.isGridSnapEnabled": true,
        "linkingTool.isUnconnectedLinkValid": true,
        "linkingTool.portGravity": 20,
        "relinkingTool.isUnconnectedLinkValid": true,
        "relinkingTool.portGravity": 20,
        "linkReshapingTool.handleArchetype":
          GO(go.Shape, "Diamond", { desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue" }),
        "undoManager.isEnabled": true
      });

  erDiagram.addDiagramListener("Modified", function(e) {
      var button = $("#SaveERButton");
      if (button) button.disabled = !erDiagram.isModified;
      if (erDiagram.isModified) {
          button.text('Save*');
      } else {
          button.text('Save');
      }
  });

  var propertyTemplate =
    GO(go.Panel, "Horizontal",
      GO(go.TextBlock,
        { isMultiline: false, editable: true },
        new go.Binding("text", "name").makeTwoWay()),
      // property type
      GO(go.TextBlock, ":",
        {editable: false}),
      GO(go.TextBlock,
        { isMultiline: false, editable: true },
        new go.Binding("text", "type").makeTwoWay()),
      GO("Button",
        {
          alignment: go.Spot.Right,
          alignmentFocus: go.Spot.Left,
          margin: 3,
          click: delProperty  // Delete property
        },
        GO(go.TextBlock, "-",  // the Button content
          { font: "bold 8pt sans-serif" })
      )
    );
    //Properties functions
  function addProperty(e, obj) {
    //Add new property to the Class
    var adorn = obj.part;
    if (adorn === null) return;
    e.handled = true;
    var arr = adorn.data.properties;
    erDiagram.startTransaction("add property");
    erDiagram.model.addArrayItem(arr, {name: "property", type: "type"});
    erDiagram.commitTransaction("add property");
  }

  function delProperty(e, obj) {
    var adorn = obj.part;
    if (adorn === null) return;
    e.handled = true;
    var arr = adorn.data.properties;// Array of Class' properties
    var itempanel = obj.panel;//Property selected
    if (arr.length > 1) { //Class must have at least 1 property
      erDiagram.startTransaction("del property");
      erDiagram.model.removeArrayItem(arr, itempanel.itemIndex);
      erDiagram.commitTransaction("del property");
    }
  }

  var nodeSelectionAdornmentTemplate = //Adornment for node selection: deepsky blue stroke
    GO(go.Adornment, "Auto",
      GO(go.Shape, { fill: null, stroke: "deepskyblue", strokeWidth: 1.5, strokeDashArray: [4, 2] }),
      GO(go.Placeholder)
    );

  erDiagram.nodeTemplate =
    GO(go.Node, "Auto",
      {
        locationSpot: go.Spot.Center,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides
      },
      GO(go.Shape,
          {
            portId: "", // the default port: if no spot on link data, use closest side
            fromLinkable: true, toLinkable: true, cursor: "pointer",
            fill: "white",  // default color
            strokeWidth: 2
          }),
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
      GO(go.Panel, "Table",
        { defaultRowSeparatorStroke: "black"},
        // header
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        GO(go.TextBlock,
          {
            row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
            font: "bold 12pt sans-serif",
            isMultiline: false, editable: true
          },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("text", "key").makeTwoWay()),
        // properties
        GO(go.Panel, "Horizontal",
          {
            row: 1, margin: 3,
            defaultAlignment: go.Spot.Center
          },
          GO(go.TextBlock, "properties",  // the Button content
              { font: "bold 8pt sans-serif" }),
          GO(go.Panel, "Vertical",
              {
                  column:0, margin: 3
              },
              GO("Button",
                {
                  alignment: go.Spot.Right,
                  alignmentFocus: go.Spot.Left,
                  click: addProperty  // adds new property to the class
                },
                GO(go.TextBlock, "+",  // the Button content
                  { font: "bold 8pt sans-serif" })
              )
          )
        ),
        GO(go.Panel, "Vertical",
         new go.Binding("itemArray", "properties"),
          {
            row: 2, margin: 3, stretch: go.GraphObject.Fill,
            defaultAlignment: go.Spot.Left, background: "lightyellow",
            itemTemplate: propertyTemplate
          }
        )
      )
    );

  // define the Link template, representing a relationship
  erDiagram.linkTemplate =
    GO(go.Link,  // the whole link panel
      {
        selectionAdorned: true,
        relinkableFrom: true,
        relinkableTo: true,
        reshapable: true,
        routing: go.Link.AvoidsNodes,
        corner: 5,
        curve: go.Link.JumpOver
      },
      GO(go.Shape,  // the link shape
        { stroke: "#303B45", strokeWidth: 2.5 }),
      GO(go.TextBlock,"1..1",  // the "from" label
        {
          textAlign: "center",
          font: "bold 14px sans-serif",
          stroke: "#1967B3",
          editable: true,
          segmentIndex: 0,
          segmentOffset: new go.Point(NaN, NaN),
          segmentOrientation: go.Link.OrientUpright
        },
        new go.Binding("text", "text").makeTwoWay()),
      GO(go.TextBlock,"1..1",  // the "to" label
        {
          textAlign: "center",
          font: "bold 14px sans-serif",
          stroke: "#1967B3",
          editable: true,
          segmentIndex: -1,
          segmentOffset: new go.Point(NaN, NaN),
          segmentOrientation: go.Link.OrientUpright
        },
        new go.Binding("text", "toText").makeTwoWay())
    );

  // initialize the Palette that is on the left side of the page
  erPalette =
    GO(go.Palette, "erPaletteDiv",  // must name or refer to the DIV HTML element
      {
        maxSelectionCount: 1,
        nodeTemplate:
            GO(go.Node, "Auto",
              GO(go.Shape,
                  {fill: "white",strokeWidth: 2}),
              new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
              { selectable: true, selectionAdornmentTemplate: nodeSelectionAdornmentTemplate },
              GO(go.Panel, "Table",
                { defaultRowSeparatorStroke: "black"},
                // header
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                GO(go.TextBlock, "Class",
                  {
                    row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
                    font: "bold 12pt sans-serif"
                  },
                  new go.Binding("text", "name").makeTwoWay()),
                // properties
                GO(go.Panel, "Vertical",
                  new go.Binding("itemArray", "properties"),
                  {
                    row: 1, margin: 3, stretch: go.GraphObject.Fill,
                    defaultAlignment: go.Spot.Left, background: "lightyellow",
                    itemTemplate:
                        GO(go.Panel, "Horizontal",
                          GO(go.TextBlock,
                            new go.Binding("text", "name")),
                          // property type
                          GO(go.TextBlock, ":",
                            {editable: false}),
                          GO(go.TextBlock,
                            new go.Binding("text", "type"))
                        )
                  }
                )
              )
            ),
        model: new go.GraphLinksModel([  // specify the contents of the Palette
          { key: "Class",
            properties: [{ name: "property", type: "type" }]}
        ])
      });

  erDiagram.model = GO(go.GraphLinksModel,
    {
      copiesArrays: true,
      copiesArrayObjects: true
    });
};