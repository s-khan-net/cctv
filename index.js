// const fs = require('fs');
// const path = require('path');
const express = require('express');
const home = require('./routes/home');
const products = require('./routes/products');
const categories = require('./routes/categories');
const reviews = require('./routes/reviews');
const features = require('./routes/features');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(express.static(`${__dirname}/public/views`));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use(helmet());
app.use(morgan('dev'));
// // create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, '\\logs\\access.log'), { flags: 'a' })

// // setup the logger
// app.use(morgan('combined', { stream: accessLogStream }))
//app.use('/',home);
app.get('/about',(req,res)=>{
    res.sendFile(`${__dirname}/public/views/about.html`)}
);
app.get('/products',(req,res)=>{
    res.sendFile(`${__dirname}/public/views/products.html`)}
);
app.use('/api/products',products);
app.use('/api/categories',categories);
app.use('/api/reviews',reviews);
app.use('/api/features',features);

app.listen(3000,() => {
   // console.log(__dirname+'\\logs\\access.log');
    console.log('listening to 3000');
})