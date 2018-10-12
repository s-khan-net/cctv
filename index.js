// const fs = require('fs');
// const path = require('path');
const express = require('express');
const home = require('./routes/home');
const products = require('./routes/products');
const categories = require('./routes/categories');
const reviews = require('./routes/reviews');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
// // create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, '\\logs\\access.log'), { flags: 'a' })

// // setup the logger
// app.use(morgan('combined', { stream: accessLogStream }))
app.use('/',home);
app.use('/api/products',products);
app.use('/api/categories',categories);
app.use('/api/reviews',reviews);

app.listen(3000,() => {
   // console.log(__dirname+'\\logs\\access.log');
    console.log('listening to 3000');
})