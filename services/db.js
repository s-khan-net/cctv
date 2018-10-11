const mysql = require('mysql');
const config = require('config');

  let con = mysql.createConnection(config.get('databaseSettings'));
  var pool = mysql.createPool(config.get('connectionPoolSettings'));
  try{
    con.connect(function(err) {
        if(err) throw err;
        console.log("Connected!");
      });
  }
  catch(ex){
    console.log("not connected",ex.message);
  }
  exports.executeQuery = function(query,callback){
    pool.getConnection(function(err, con) {
        if(err) { console.log(err); callback(true); return; }
        console.log(query);
        con.query(query,(err,result)=>{
            con.release();
            if(err) {console.log(err);callback(false);return;}
            callback(false,result)
        });
    });
  }
  //exports.con = con;