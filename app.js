require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WEB-APP');

const app = require('express')();
const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');

const User = require('./models/userModel')

app.use('/', userRoute);

const io = require('socket.io')(http);
var usp = io.of('/user-namespace');
usp.on('connection',async function(socket){
    console.log('user connected');
    var userId = socket.handshake.auth.token;
    
   await User.findByIdAndUpdate({ _id: userId}, { $set:{ is_online:'1'}})

    socket.on('disconnect',async function(){
        console.log('user disconnected')
        var userId = socket.handshake.auth.token;
    
        await User.findByIdAndUpdate({ _id: userId}, { $set:{ is_online:'0'}})
    });
});

http.listen(3000, function(){
    console.log('server is running')
});