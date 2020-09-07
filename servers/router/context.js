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

router.get('/api/check', (req, res, next) => {
  var password = req.query.password;
  var no = req.query.no;
  let para = 'y';

  const query = `SELECT password FROM btboard WHERE no=${no}`;

  connection.query(query, function(err, result) {
    if(!err) {
      if(password == result[0].password) {
        console.log('query success');
        res.send(para);
        console.log('비밀번호 일치 : '+para);
      } else  {
        para='n';
        res.send(para);
        console.log('비밀번호 다름 : '+para);
      }
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  });
})

router.post('/api/modify', (req, res, next) => {
  var gotT = req.body.title;
  var gotC = req.body.context;
  var gotD = req.body.date;
  var num = req.body.no;
  
  let query = `UPDATE btboard SET
               title='${gotT}', context='${gotC}', date='${gotD}'
               WHERE no='${num}'`
  connection.query(query , function(err, rows) {
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

router.post('/api/delete', (req, res, next) => {
  var num = req.body.no;
  let query = `DELETE FROM btboard WHERE no=${num}`;

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