var express = require('express');
var path = require('path');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
//router.get('/',function(req,res, next){
//  res.sendFile(path.join(__dirname,'../', '/home.html'));
  //__dirname : It will resolve to your project folder.
//});

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
});

module.exports = router;
