require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/WEB-APP');

const app = require('express')();
const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');

const User = require('./models/userModel');
const Chat = require('./models/chatModel');
// const { Console } = require('console'); mistakenly imported by me not required in this project 

app.use('/', userRoute);

const io = require('socket.io')(http);
var usp = io.of('/user-namespace');
usp.on('connection',async function(socket){
    console.log('user connected');
    var userId = socket.handshake.auth.token;
    
   await User.findByIdAndUpdate({ _id: userId}, { $set:{ is_online:'1'}})

    // telling connection i am online 
    socket.broadcast.emit('getOnlineUser', {user_id: userId});

    socket.on('disconnect',async function(){
        console.log('user disconnected')
        var userId = socket.handshake.auth.token;
    
        await User.findByIdAndUpdate({ _id: userId}, { $set:{ is_online:'0'}})

        // telling connection i am offline 
        socket.broadcast.emit('getOfflineUser', {user_id: userId});

    });

    // for showing bot side chats 
    socket.on('newChat', function(data){
        // Console.log('new chat received', data)
        socket.broadcast.emit('loadNewChat', data);
    });

    // for loading previous chat 
    socket.on('existsChat', async function (data) {
        var chats = await Chat.find({ $or:[
            {sender_id: data.sender_id, receiver_id: data.receiver_id.trim()},
            {sender_id: data.receiver_id.trim(), receiver_id: data.sender_id},
        ]});
        socket.emit('loadChats', {chats: chats});
    });


    //for showing group chats in container
    socket.on('newGroupChat', function(data){
        // Console.log('new chat received', data)
        socket.broadcast.emit('loadNewGroupChat', data);
    });
});

http.listen(3000, function(){
    console.log('server is running')
});