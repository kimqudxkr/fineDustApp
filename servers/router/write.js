const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('content/board/write');
})

router.get('/api/insert', (req, res, next) => {
  const gotW = req.param('writer');
  const gotT = req.param('title');
  const gotC = req.param('context');
  const gotD = req.param('date');
  const gotP = req.param('password');

  let query = `INSERT INTO btboard(title, writer, date, context, password) 
               VALUES('${gotT}','${gotW}','${gotD}','${gotC}','${gotP}')`
               
  connection.query(query, function(err, rows) {
    if(!err) {
      const log = 'sucess'
      console.log('query success');
      res.send(log);
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  });
})

module.exports = router;