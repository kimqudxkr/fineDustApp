const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('content/write');
})

router.get('/api/insert', (req, res, next) => {
  var gotW = req.param('writer');
  var gotT = req.param('title');
  var gotC = req.param('context');
  var gotD = req.param('date');
  var gotP = req.param('password');

  let query = `INSERT INTO btboard(title, writer, date, context, password) 
               VALUES('${gotT}','${gotW}','${gotD}','${gotC}','${gotP}')`
               
  connection.query(query, function(err, rows) {
    if(!err) {
      var log = 'sucess'
      console.log('query success');
      res.send(log);
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  });
})

module.exports = router;