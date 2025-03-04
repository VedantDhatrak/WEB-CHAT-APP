require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WEB-APP');

const app = require('express')();
const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

http.listen(3000, function(){
    console.log('server is running')
});