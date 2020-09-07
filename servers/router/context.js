const express = require('express');
const router = express.Router();
const connection = require("../connection");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('content/context');
});

  
router.get('/:no', function(req, res, next) {
    var num = req.params.no;
    const query = 'SELECT * FROM btboard WHERE no='+num;

    connection.query(query, function(err, rows) {
        if(!err) {
            res.render('content/context',{result:rows});
          } else {
            console.log('query error : '+err);
            res.send(err);
          }
        });
})

module.exports = router;