const express = require('express');
const Joi = require('joi');
const db = require('../services/db');
const router = express.Router();

router.get('/',(req,response) =>{
    db.executeQuery('select * from products',(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let product = JSON.parse(JSON.stringify(res));
        if(product.length==0) { response.status(404).send("Didn't find products"); return;}
        response.status(200).send(product);
    });
});

router.post('/',(req, response)=>{
    let { error } = validateProduct(req.body);
    if(error) return response.status(400).send(error.details[0].message);
    
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    let record=[];
    record.push(`'${req.body.name}'`);
    record.push(`'${req.body.brand}'`);
    record.push(!req.body.warranty?'null':`'${req.body.warranty}'`);
    record.push(!req.body.color?'null':`'${req.body.color}'`);
    record.push(req.body.primaryImage || `'/images/productimage'`);
    record.push(!req.body.publisher?'null':`'${req.body.publisher}'`);
    record.push(req.body.inStock || 0);
    record.push(req.body.isActive || 1);
    record.push(req.body.description || `'Product description not available'`);
    record.push(req.body.retailPrice || 0.00);
    record.push(req.body.splPrice || 0.00);
    record.push(req.body.discount || 0);
    record.push(`'${date}'`);
    record.push(`'${date}'`);
    record.push(req.body.categoryId || 3);
    record.push(req.body.reviewId || `null`);
    record.push(req.body.featuresId || `null`);
    console.log(record);
    var sql = "INSERT INTO products (name,brand,warranty,color,primaryImage,publisher,inStock,isActive,description,retailPrice,splPrice,discount,created,modified,categoryId,reviewId,featuresId) values ("+record+");";
    //('"+name+"','"+brand+"','"+warranty+"','"+color+"','"+primaryImage+"','"+publisher+"',"+inStock+","+isActive+",'"+description+"',"+retailPrice+","+splPrice+","+discount+",'"+created+"','"+modified+"',"+categoryId+","+reviewId+","+featuresId+");";

    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        response.status(300).send("1 record inserted, ID: " + r.insertId);
    });

});
function validateProduct(product){
    const schema = {
        name:Joi.string().min(5).required(),
        brand:Joi.string().min(3).required(),
        warranty:Joi.string(),
        color:Joi.string(),
        primaryImage:Joi.string(),
        publisher:Joi.string(),
        inStock:Joi.boolean(),
        isActive:Joi.boolean(),
        description:Joi.string(),
        retailPrice:Joi.number(),
        splPrice:Joi.number(),
        discount:Joi.number(),
        categoryId:Joi.number(),
        reviewId:Joi.number(),
    };

    return Joi.validate(product,schema);
}
module.exports = router;