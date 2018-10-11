const mysql = require('mysql');

module.exports = function (req,res,next){
    console.log('checking if database is present');
    next();
}