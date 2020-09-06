const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET board page. */
router.get('/', (req, res, next) => {
  const query = 'SELECT no, title, writer, date FROM btboard';
  connection.query(query, function(err, rows) {
    if(!err) {
      res.render('content/board',{result:rows});
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  });
})

module.exports = router;
