const express = require('express');
const Joi = require('joi');
const db = require('../services/db');
const router = express.Router();

router.get('/',(req,response)=>{
    let sql='';
    if(req.query.reviewer){
        sql  = "select * from reviewswhere reviewer = '"+req.query.reviewer+"'";
    }
    if(req.query.productId){
        sql  = "select * from reviews,products where products.productId = reviews.productId and reviewer.productId = '"+req.query.productId+"'";
    }
    db.executeQuery(sql,(err,res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let reviews = JSON.parse(JSON.stringify(res));
        if(reviews.length==0) { response.status(404).send("Didn't find reviews"); return;}
        response.status(200).send(reviews);
    });
});

router.get('/ratings/:productId',(req,response)=>{
    let sql="select count(1) rated, sum(rating) rate  from reviews where productId="+req.params.productId;
    db.executeQuery(sql,(err,res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let rating = JSON.parse(JSON.stringify(res));
        if(rating.rated==0) { response.status(404).send("Not rated"); return;}
        response.status(200).send(rating);
    });
});

router.post('/',(req,res) =>{
    let { error } = validateReview(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    record=[];
    record.push(`'${req.body.reviewer}'`);
    record.push(`'${req.body.review}'`);
    record.push(!req.body.rating?`null`:req.body.rating);
    record.push(`'${date}'`);
    record.push(`'${date}'`);
    record.push(!req.body.productId?`null`:req.body.productId)
    var sql = "INSERT INTO reviews (reviewer,review,rating,created,modified,productId) VALUES ("+record+");";
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        res.status(300).send("1 record inserted, ID: " + r.insertId);
    });
});

router.put('/:id',(req,res) =>{
    let { error } = validateReview(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    record=[];
    record.push(` reviewer = '${req.body.reviewer}'`);
    record.push(` review = '${req.body.review}'`);
    record.push(!req.body.rating?` rating = null`:` rating = ${req.body.rating}`);
    record.push(` modified = '${date}'`);
    var sql = `update reviews set${record} where id = ${req.params.id};`;
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        res.status(300).send("1 record updated: " + r.message);
    });
});
function validateReview(review){
    schema = {
        reviewer:Joi.string().min(4),
        review:Joi.string().min(5).max(255).required(),
        rating:Joi.number(),
        productId:Joi.number().required()
    };

    return Joi.validate(review,schema);
}

module.exports = router;