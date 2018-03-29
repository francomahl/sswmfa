var express = require('express');
var path = require('path');
var router = express.Router();
var fs = require('fs');

router.get('/', function (req, res) {
  res.render('sswmfa')
})

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
