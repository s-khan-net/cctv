const express = require('express');
const Joi = require('joi');
const db = require('../services/db');
const router = express.Router();

router.get('/',(req,response) =>{
    let sql='select * from features';
    if(req.query.productId)
        sql = 'select name product_name,features,main_feature,productId from features,products where products.id = '+req.query.productId;

    db.executeQuery(sql,(err, res)=>{
        if(err) { response.status(500).send("Server Error"); return;}
        let categories = JSON.parse(JSON.stringify(res));
        if(categories.length==0) { response.status(404).send("Didn't find features"); return;}
        response.status(200).send(categories);
    });
});

module.exports = router;