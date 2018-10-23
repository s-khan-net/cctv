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

  exports.insertProducts = function(queries,callback){
    pool.getConnection(function(err, con) {
        if(err) { console.log(err); callback(true); return; }
        console.log(queries);
        con.beginTransaction(function(err){
          if(err) {
            con.rollback(function() {
              con.release();
              //Failure
            });
          }
          else{
            con.query(queries[0],(err,result1)=>{
              if(err) {
                con.rollback(function() {
                  console.log(err)
                });
                callback(false);
                return;
              }
              else{
                con.query(queries[1], result1.insertId, function(err, result2) {
                  if (err) { 
                    con.rollback(function() {
                      throw err;
                    });
                  }  
                  con.commit(function(err) {
                    if (err) { 
                      con.rollback(function() {
                        throw err;
                      });
                    }
                    callback(false,{res1:result1,res2:result2});
                  });
                });
              }
              
            });
          }
        })
        
    });
  }
  //exports.con = con;