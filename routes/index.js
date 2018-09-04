var express = require('express');
var path = require('path');
var router = express.Router();
var fs = require('fs');

let eCount = 0;
let entities = '';

let erModelJSON =
`
{ "class": "go.GraphLinksModel",
  "copiesArrays": true,
  "copiesArrayObjects": true,
  "modelData": {"position":"-5 -5"},
  "nodeDataArray": [
  ${entities}
  ],
  "linkDataArray": []}
`;

const navModelJSON = 
`
{ "class": "go.GraphLinksModel",
  "copiesArrays": true,
  "copiesArrayObjects": true,
  "modelData": {"position":"-695.3752263362952 -276.89847869873046"},
  "nodeDataArray": [ {"name":"Index", "isGroup":true, "category":"MainPage", "key":-1} ],
  "linkDataArray": []}
`;

router.get('/', function (req, res) {
  res.render('sswmfa', { ERModel: erModelJSON, NavModel: navModelJSON });
});

router.post("/createEntity", function(req, res){
  eCount++;
  let properties = "";
  
  req.body.fields.forEach( (field,index) => {
    property = `{"name":"${field.name}", "type":"${field.type}", "unique":${field.unique}, "nullable":${field.nullable}}`;
    properties = (properties === '') ? property : `${properties},${property}`;
  });
  
  let entity = `{"name":"${req.body.class}", "properties":[ ${properties} ], "key":-${eCount}, "loc":"${320 + eCount*10} 80"}`;

  entities = (entities === '') ? entity : `${entities}, ${entity}`;
  erModelJSON =
  `
  { "class": "go.GraphLinksModel",
    "copiesArrays": true,
    "copiesArrayObjects": true,
    "modelData": {"position":"-5 -5"},
    "nodeDataArray": [
    ${entities}
    ],
    "linkDataArray": []}
  `;
  res.end();
});

router.get("/clearEntities", function(req, res){
  eCount = 0;
  entities = '';
  erModelJSON =
  `
  { "class": "go.GraphLinksModel",
    "copiesArrays": true,
    "copiesArrayObjects": true,
    "modelData": {"position":"-5 -5"},
    "nodeDataArray": [
    ],
    "linkDataArray": []}
  `;
  res.redirect('/');
});


router.post('/createFile', function(req, res, next){
	var fileContent = req.body.fileContent
	var fileName = req.body.fileName
	var dir = req.body.dir
  fs.writeFile(path.join(__dirname, dir, fileName), fileContent, function(err) {
    if(err) {
        return console.log(err);
    }
    return console.log("File created!");
  });
  res.end();
});

module.exports = router;
