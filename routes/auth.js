const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');
const db = require('../services/db');
const bcrypt=require('bcrypt');
const router = express.Router();

router.post('/',(req,response) =>{
    let { error } = validate(req.body);
    if(error) return response.status(400).send(error.details[0].message);

    var existsQ = "select * from users where email='"+req.body.email+"'";
    db.executeQuery( existsQ , function(e,r){
        if(e){
            response.sendStatus(500).send(500,"Server Error"); 
            return;
        }
        let re = JSON.parse(JSON.stringify(r));
        if(!re[0]){
            response.status(400).send('Invalid email or password'); 
            return;
        }
        let valid= bcrypt.compareSync(req.body.password,re[0].sPassword);
        if(!valid){
            response.status(400).send('Invalid email or password'); 
            return;
        }
        else{
            const token = jwt.sign({id:re[0].id,fname:re[0].first_name,lname:re[0].last_name,email:re[0].email,isAdmin:re[0].isAdmin},config.get('cctvKey'),{ expiresIn:120 });
            response.header('x-cctv-auth-key',token).status(200).send(`fine, url:/api/users/${re[0].id}`);
        }
    });
});
router.post('/verify/:token',(req,response) =>{
    try{
        const decoded = jwt.verify(req.params.token,config.get('cctvKey'));
        if(!decoded) return response.status(400).send('Invalid token');
        response.status(200).send(decoded);
    }
    catch(ex){
        response.status(400).send(`Invalid token, error: ${ex.name}`);
    }
});

function validate(req){
    const schema = {
        email:Joi.string().email().required(),
        password:Joi.string().min(4).required()
    };

    return Joi.validate(req,schema);
}
module.exports = router;