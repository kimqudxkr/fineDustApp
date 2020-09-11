const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.no) {
    const num = req.query.no;
    const query = 'SELECT * FROM btboard WHERE no='+num;

    connection.query(query, function(err, rows) {
      if(!err) {
        res.render('content/board/show',{result:rows});
      } else {
        console.log('query error : '+err);
        res.send(err);
          }
      });
  } else {
    console.log('no param');
    res.render('content/board/show');
    }
})

router.get('/api/check', (req, res, next) => {
  const password = req.query.password;
  const no = req.query.no;
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
  const gotT = req.body.title;
  const gotC = req.body.context;
  const gotD = req.body.date;
  const num = req.body.no;
  
  let query = `UPDATE btboard SET
               title='${gotT}', context='${gotC}', date='${gotD}'
               WHERE no='${num}'`
  connection.query(query , function(err, rows) {
    if(!err) {
      const log = 'sucess'
      console.log('query success');
      res.send(log);
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  })
})

router.post('/api/delete', (req, res, next) => {
  const num = req.body.no;
  const query = `DELETE FROM btboard WHERE no=${num}`;

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