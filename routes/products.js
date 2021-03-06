const express = require('express');
const Joi = require('joi');
const db = require('../services/db');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();

router.get('/',(req,response) =>{
    let sql='';
    sql = 'select products.id,products.categoryId,categories.name category,products.name,products.brand,products.color,products.description,products.retailPrice,products.splPrice,products.discount,products.warranty,products.primaryImage,sum(reviews.rating) rating from categories,products left outer join reviews on products.id=reviews.productId  where  products.categoryId = categories.id ';
    if(req.query){
        if(req.query.name){
            sql = sql+ "and products.name like %'"+req.query.name+"'";
        }
        if(req.query.discount){
            sql = sql+ " and products.discount >="+req.query.discount+"'";
        }
        if(req.query.price){
            sql = sql+ " and products.retailPrice between "+req.query.price1+" and "+req.query.price2;
        }
        if(req.query.categoryId){
            sql = sql+ " and products.categoryId = "+req.query.categoryId;
        }
        if(req.query.categoryName){
            sql = sql+ " and categories.name = "+req.query.categoryName;
        }
        if(req.query.brand){
            sql = sql+ " and products.brand = "+req.query.brand;
        }
        if(req.query.color){
            sql = sql+ " and products.color = "+req.query.color;
        }
        sql = sql + ' group by products.name';
        if(req.query.orderby){
            sql = sql + " order by "+req.query.orderby;
        }
        else{
            sql = sql + ' order by products.name';
        }
    }
    else{
        sql = sql + ' group by products.name order by  rating ';
    }
    db.executeQuery(sql,(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let product = JSON.parse(JSON.stringify(res));
        if(product.length==0) { response.status(404).send("Didn't find products"); return;}
        response.status(200).send(product);
    });
});

router.post('/',(req, response)=>{
    try{
        const decoded = jwt.verify(req.params.token,config.get('cctvKey'));
        if(!decoded) return response.status(400).send('Invalid token');
    }
    catch(ex){
        response.status(401).send(`Cannot add products, error: ${ex.name}`);
    }

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
    record.push(req.body.primaryImage || `'/images/productImage.jpg'`);
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

    let feature = [];
    feature.push(req.body.features?`'${req.body.features}'`:`null`);
    feature.push(req.body.main_feature?`'${req.body.main_feature}'`:`null`);
    feature.push('?');

    var sql = "INSERT INTO products (name,brand,warranty,color,primaryImage,publisher,inStock,isActive,description,retailPrice,splPrice,discount,created,modified,categoryId,reviewId,featuresId) values ("+record+");";
    //('"+name+"','"+brand+"','"+warranty+"','"+color+"','"+primaryImage+"','"+publisher+"',"+inStock+","+isActive+",'"+description+"',"+retailPrice+","+splPrice+","+discount+",'"+created+"','"+modified+"',"+categoryId+","+reviewId+","+featuresId+");";
    var fsql = 'INSERT INTO features (features,main_feature,productId) values ('+feature+');'
    db.insertProducts([sql,fsql], function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        response.status(300).send("1 product inserted, ID: " + r.res1.insertId +" with features ID: "+r.res2.insertId);
        
    });

});
router.put('/:id',(req, response)=>{
    let { error } = validateProduct(req.body);
    if(error) return response.status(400).send(error.details[0].message);
    
    date = new Date();
    date = date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
    let record=[];
    record.push(` name = '${req.body.name}'`);
    record.push(` brand = '${req.body.brand}'`);
    record.push(!req.body.warranty?' warranty = null':` warranty = '${req.body.warranty}'`);
    record.push(!req.body.color?' color = null':` color = '${req.body.color}'`);
    record.push(req.body.primaryImage?` primaryImage = '${req.body.primaryImage}'`:` primaryImage = '/images/productimage'`);
    record.push(!req.body.publisher?' publisher=null':` publisher='${req.body.publisher}'`);
    record.push(req.body.inStock?` inStock = ${req.body.inStock}`:` inStock = 0`);
    record.push(req.body.isActive?` isActive = ${req.body.isActive}`:` isActive = 1`);
    record.push(req.body.description?` description = '${req.body.description}'`:` description='Product description not available'`);
    record.push(req.body.retailPrice?` retailPrice = ${req.body.retailPrice}`:` retailPrice = 0.00`);
    record.push(req.body.splPrice?` splPrice = ${req.body.splPrice}`:` splPrice = 0.00`);
    record.push(req.body.discount?` discount=${req.body.discount}`:` discount = 0`);
    //record.push(`'${date}'`);
    record.push(` modified = '${date}'`);
    record.push(req.body.categoryId?` categoryId = ${req.body.categoryId}`:` categoryId = 3`);
    record.push(` reviewId = null`);
    record.push(` featuresId = null`);
    
    var sql = `update products set${record} where id=${req.params.id};`;
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        response.status(300).send("1 record updated: " + r.message);
    });

});

router.delete('/:id',(req,response)=>{
    var sql = `delete from products where id=${req.params.id};`;
    db.executeQuery(sql, function (err, result) {
        if(err) { res.status(500).send(500,"Server Error"); return;}
        let r = JSON.parse(JSON.stringify(result));
        console.log(r);
        response.status(300).send("1 record deleted: " + r.message);
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
        inStock:Joi.number(),
        isActive:Joi.number(),
        description:Joi.string(),
        retailPrice:Joi.number(),
        splPrice:Joi.number(),
        discount:Joi.number(),
        categoryId:Joi.number(),
        reviewId:Joi.number(),
        features:Joi.string(),
        main_feature:Joi.string()
    };

    return Joi.validate(product,schema);
}
module.exports = router;