const express = require('express')
const cors = require('cors')

const app = express()


// app.options('*', cors());
// app.use(cors({origin: ['https://www.th.technophil.xyz', 'http://127.0.0.1:8800']}));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://www.th.technophil.xyz');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


const io = require('socket.io')(8800)

let activeUsers = []

io.on("connection",(socket)=> {
    //add new user
    socket.on('new-user-add',(newUserId)=>{
        //if user is not added previously
        if(!activeUsers.some((user)=>user.userId === newUserId))
        {
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id
            })
        }
        console.log("connected users", activeUsers);
        io.emit('get-users',activeUsers) 
    })


    //send message
    socket.on("send-message",(data) =>{
        const {receiverId} = data;
        const user = activeUsers.find((user)=> user.userId === receiverId)
        console.log("sending from socket to : " , receiverId);
        console.log("Data", data);
        if(user){
            io.to(user.socketId).emit("receive-message",data)
        }
    })
    
    socket.on("disconnect",()=>{
        activeUsers = activeUsers.filter((user)=>user.socketId !== socket.id)
        console.log("user disconnected", activeUsers);
        io.emit('get-users',activeUsers) 
    })
})