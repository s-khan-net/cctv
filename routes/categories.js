const express = require('express');
const Joi = require('joi');
const db = require('../services/db');
const router = express.Router();

router.get('/',(req,response) =>{
    db.executeQuery('select * from categories',(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let categories = JSON.parse(JSON.stringify(res));
        if(categories.length==0) { response.status(404).send("Didn't find categories"); return;}
        response.status(200).send(categories);
    });
});
router.get('/:id',(req,response) =>{
    db.executeQuery('select * from categories where id='+req.params.id,(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let category = JSON.parse(JSON.stringify(res));
        if(category.length==0) { response.status(404).send("Didn't find category"); return;}
        response.status(200).send(category);
    });
});

router.post('/',(req,res) =>{
    let { error } = validateCategory(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    var sql = "INSERT INTO categories (name,description,created,modified,productId) VALUES ('"+req.body.name+"','"+req.body.description+"','"+date+"','"+date+"');";
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        res.status(300).send("1 record inserted, ID: " + r.insertId);
    });
});

router.put('/:id',(req,res) =>{
    let { error } = validateCategory(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    //var sql = "update categories set(name,description,created,modified) VALUES ('"+req.body.name+"','"+req.body.description+"','"+date+"','"+date+"');";
    var sql=`update categories set name = '${req.body.name}', description = '${req.body.description}', modified = '${date}' where id = ${req.params.id} ;`;
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        res.status(300).send("1 record updated: " + r.message);
    });
});

router.delete('/:id',(req,res)=>{
    var sql=`delete from categories where id = ${req.params.id} ;`;
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        res.status(300).send("1 record deleted: " + r.message);
    });
})

function validateCategory(category){
    let schema = {
        name : Joi.string().min(3).required(),
        description:Joi.string()
    }
    let res = Joi.validate(category,schema);

    return res;
}

module.exports = router;