const express = require('express');
const Joi = require('joi');
const db = require('../services/db');
const bcrypt=require('bcrypt');
const router = express.Router();

router.get('/',(req,response) =>{
    let sql='select first_name,last_name,email from users';
    
    db.executeQuery(sql,(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let user = JSON.parse(JSON.stringify(res));
        if(user.length==0) { response.status(404).send("Didn't find users"); return;}
        response.status(200).send(user);
    });
});
router.get('/:id',(req,response) =>{
    let sql='select first_name,last_name,email from users where id='+req.params.id;
    
    db.executeQuery(sql,(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let user = JSON.parse(JSON.stringify(res));
        if(user.length==0) { response.status(404).send(`Didn't find user with id ${req.params.id}`); return;}
        response.status(200).send(user);
    });
});
router.get('/check/:email',(req,res)=>{
    var existsQ = "select count(1) e from users where email='"+req.params.email+"'";
    db.executeQuery( existsQ , function(e,r){
        if(e) { res.sendStatus(500).send(500,"Server Error"); return;}
        let re = JSON.parse(JSON.stringify(r));
        console.log(re[0].e);
        res.status(404).send(re[0]);
    })
})
router.post('/', (req,res)=>{
    let { error } = validateUser(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    let record=[];
    record.push(`'${req.body.first_name}'`);
    record.push(`'${req.body.last_name}'`);
    record.push(`'${req.body.email}'`);
    // const salt=await bcrypt.genSalt(10);
    // console.log(salt);
    const pwd= bcrypt.hashSync(req.body.password,10);
    
    record.push(`'${pwd}'`);
    record.push(`'${date}'`);
    record.push(`'${date}'`);

    var sql = "INSERT INTO users (first_name,last_name,email,sPassword,created,modified) values ("+record+");";
   
    var existsQ = "select count(1) e from users where email='"+req.body.email+"'";
    db.executeQuery( existsQ , function(e,r){
        if(e) { res.sendStatus(500).send(500,"Server Error"); return;}
        let re = JSON.parse(JSON.stringify(r));
        console.log(re[0].e);
        if(re[0].e>0){res.status(400).send('User exists with this email'); return;}
        else{
            db.executeQuery(sql, function (err, result) {
                if(err) { res.status(500).send(500,"Server Error"); return;}
                re = JSON.parse(JSON.stringify(result));
                console.log(re);
                res.status(300).send(`1 user inserted, ID: ${re.insertId}, url:/api/users/${re.insertId}`);
            });
        }
    });

    
});

function validateUser(user){
    const schema = {
        first_name:Joi.string().min(4).required(),
        last_name:Joi.string().min(4).required(),
        email:Joi.string().email().required(),
        password:Joi.string().min(4).required()
    };

    return Joi.validate(user,schema);
}
module.exports = router;