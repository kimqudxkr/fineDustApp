const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.no) {
    var num = req.query.no;
    const query = 'SELECT * FROM btboard WHERE no='+num;

    connection.query(query, function(err, rows) {
      if(!err) {
        console.log('파람받고 넘어옴')
        res.render('content/context',{result:rows});
      } else {
        console.log('query error : '+err);
        res.send(err);
          }
      });
  } else {
    console.log('no param');
    res.render('content/context');
    }
})

router.get('/api/modify', (req, res, next) => {
  var gotT = req.param('title');
  var gotC = req.param('context');
  var gotD = req.param('date');
  var num = req.param('no');
  
  connection.query('UPDATE btboard SET'+
                    'title=\''+gotT+'\', context=\''+gotC+'\', date=\''+gotD+'\''
                    +'WHERE no='+num , function(err, rows) {
    if(!err) {
      var log = 'sucess'
      console.log('query success');
      res.send(log);
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  })
})

  router.get('/api/delete', (req, res, next) => {
    var num = req.query.no;
    
    connection.query('DELETE FROM btboard WHERE no='+num, function(err, rows) {
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