"use strict";
/*
*  Copyright (C) 1998-2017 by Northwoods Software Corporation. All Rights Reserved.
*/

import * as go from "../release/go";
import { Inspector } from "./DataInspector";

var myDiagram: go.Diagram = null;

export function init() {
	if (typeof (<any>window)["goSamples"] === 'function') (<any>window)["goSamples"]();  // init for these samples -- you don't need to call this

	var $ = go.GraphObject.make;  // for conciseness in defining templates

	myDiagram =
		$(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
			{
				"animationManager.isEnabled": false,
				// position the graph in the middle of the diagram
				initialContentAlignment: go.Spot.Center,
				// allow double-click in background to create a new node
				"clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" },
				// allow Ctrl-G to call groupSelection()
				"commandHandler.archetypeGroupData": { text: "Group", isGroup: true, color: "blue" },
				// enable undo & redo
				"undoManager.isEnabled": true
			});

	// These nodes have text surrounded by a rounded rectangle
	// whose fill color is bound to the node data.
	// The user can drag a node by dragging its TextBlock label.
	// Dragging from the Shape will start drawing a new link.
	myDiagram.nodeTemplate =
		$(go.Node, "Auto",
			{ locationSpot: go.Spot.Center },
			new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
			$(go.Shape, "Rectangle",
				{
					stroke: null, strokeWidth: 0,
					fill: "white", // the default fill, if there is no data-binding
					portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
					// allow all kinds of links from and to this port
					fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
					toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
				},
				new go.Binding("fill", "color")),
			$(go.TextBlock,
				{
					font: "bold 18px sans-serif",
					stroke: '#111',
					margin: 8,  // make some extra space for the shape around the text
					isMultiline: false,  // don't allow newlines in text
					editable: true  // allow in-place editing by user
				},
				new go.Binding("text", "text").makeTwoWay())
		);

	// The link shape and arrowhead have their stroke brush data bound to the "color" property
	myDiagram.linkTemplate =
		$(go.Link,
			{ toShortLength: 3, relinkableFrom: true, relinkableTo: true },  // allow the user to relink existing links
			$(go.Shape,
				{ strokeWidth: 2 },
				new go.Binding("stroke", "color")),
			$(go.Shape,
				{ toArrow: "Standard", stroke: null },
				new go.Binding("fill", "color"))
		);

	// Groups consist of a title in the color given by the group node data
	// above a translucent gray rectangle surrounding the member parts
	myDiagram.groupTemplate =
		$(go.Group, "Vertical",
			{
				selectionObjectName: "PANEL",  // selection handle goes around shape, not label
				ungroupable: true
			},  // enable Ctrl-Shift-G to ungroup a selected Group
			$(go.TextBlock,
				{
					font: "bold 19px sans-serif",
					isMultiline: false,  // don't allow newlines in text
					editable: true  // allow in-place editing by user
				},
				new go.Binding("text", "text").makeTwoWay(),
				new go.Binding("stroke", "color")),
			$(go.Panel, "Auto",
				{ name: "PANEL" },
				$(go.Shape, "Rectangle",  // the rectangular shape around the members
					{ fill: "rgba(128,128,128,0.2)", stroke: "gray", strokeWidth: 3 }),
				$(go.Placeholder, { padding: 10 })  // represents where the members are
			)
		);

	// Create the Diagram's Model:
	var nodeDataArray = [
		{ key: 1, text: "Alpha", password: "1234", color: "#B2DFDB" },
		{ key: 2, text: "Beta", color: "#B2B2DB" },
		{ key: 3, text: "Gamma", color: "#1DE9B6", group: 5 },
		{ key: 4, text: "Delta", color: "#00BFA5", group: 5 },
		{ key: 5, text: "Epsilon", color: "#00BFA5", isGroup: true }
	];
	var linkDataArray = [
		{ from: 1, to: 2, color: "#5E35B1" },
		{ from: 2, to: 2, color: "#5E35B1" },
		{ from: 3, to: 4, color: "#6200EA" },
		{ from: 3, to: 1, color: "#6200EA" }
	];
	myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

	// some shared model data
	myDiagram.model.modelData = { test: true, hello: "world", version: 42 };

	// select a Node, so that the first Inspector shows something
	myDiagram.select(myDiagram.nodes.first());


	// Declare which properties to show and how.
	// By default, all properties on the model data objects are shown unless the inspector option "includesOwnProperties" is set to false.
	// Show the primary selection's data, or blanks if no Part is selected:
	var inspector1 = new Inspector('myInspectorDiv1', myDiagram,
		{
			// uncomment this line to only inspect the named properties below instead of all properties on each object:
			// includesOwnProperties: false,
			properties: {
				"text": { },
				// an example of specifying the <input> type
        "password": { show: Inspector.prototype.showIfPresent(myDiagram.selection.first(), "password"), type: 'password' },
				// key would be automatically added for nodes, but we want to declare it read-only also:
				"key": { readOnly: true, show: Inspector.prototype.showIfPresent(myDiagram.selection.first(), "key") },
				// color would be automatically added for nodes, but we want to declare it a color also:
				"color": { show: Inspector.prototype.showIfPresent(myDiagram.selection.first(), "key"), type: 'color' },
				// Comments and LinkComments are not in any node or link data (yet), so we add them here:
				"Comments": { show: Inspector.prototype.showIfNode(myDiagram.selection.first()) },
				"flag": { show: Inspector.prototype.showIfNode(myDiagram.selection.first()), type: 'boolean', defaultValue: true },
				"LinkComments": { show: Inspector.prototype.showIfLink(myDiagram.selection.first()) },
        "isGroup": { readOnly: true, show: Inspector.prototype.showIfNode(myDiagram.selection.first()) }
			}
		});
	//inspector1.inspectObject(myDiagram.nodes.first().data);

	// Always show the first Node:
	var inspector2 = new Inspector('myInspectorDiv2', myDiagram,
		{
			// By default the inspector works on the Diagram selection.
        // This property lets us inspect a specific object by calling Inspector.prototype.inspectObject(object)
			inspectSelection: false,
			properties: {
				"text": {},
				// This property we want to declare as a color, to show a color-picker:
				"color": { type: 'color' },
				// key would be automatically added for node data, but we want to declare it read-only also:
				"key": { readOnly: true, show: Inspector.prototype.showIfPresent(myDiagram.selection.first(), "key") }
			}
		});
	// If not inspecting a selection, you can programatically decide what to inspect (a Part, or a JavaScript object)
	inspector2.inspectObject(myDiagram.nodes.first().data);

	// Always show the model.modelData:
	var inspector3 = new Inspector('myInspectorDiv3', myDiagram,
		{
			inspectSelection: false
		});
	inspector3.inspectObject(myDiagram.model.modelData);
}