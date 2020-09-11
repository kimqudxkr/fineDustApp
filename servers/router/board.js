const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET board page. */
router.get('/', (req, res, next) => {
  const query = 'SELECT no, title, writer, date FROM btboard';

  const resetQuery1 = `ALTER TABLE btboard auto_increment=1`
  const resetQuery2 = `set @COUNT=0`
  const resetQuery3 = `update btboard set btboard.no = @COUNT:=@COUNT+1`

  connection.query(resetQuery1);
  connection.query(resetQuery2);
  connection.query(resetQuery3);

  connection.query(query, function(err, rows) {
    if(!err) {
      res.render('content/board/board',{result:rows});
    } else {
      console.log('query error : '+err);
      res.send(err);
    }
  });
})

module.exports = router;
