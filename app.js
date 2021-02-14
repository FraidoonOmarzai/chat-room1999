const express = require('express')
const http = require('http')
const socketio = require('socket.io')
require('dotenv').config()
const {generateMsg, generateLocMsg} = require('./utils/msg')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static('public'))

// connecting to chat
io.on('connection', (socket)=>{
    console.log('New websocket connection')


    // join the chat room
    socket.on('join',({username, room}, callback)=>{
        const {error, user} = addUser({
            id:socket.id,
            username,
            room
        })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('msg',generateMsg('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('msg', generateMsg('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUserInRoom(user.room)
        })

        callback()
    })


    // send messages
    socket.on('sendMsg',(message, callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('msg', generateMsg(user.username, message))
        callback()
    })

    // share location 
    socket.on('sendLoc',(obj, callback)=>{
        const user = getUser(socket.id)

        locUrl = `https://google.com/maps?q=${obj.lat},${obj.long}`
        io.to(user.room).emit('locMsg', generateLocMsg(user.username, locUrl))
        callback()
    })

    // disconnect from chating
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('msg', generateMsg('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }

    })
})

server.listen(process.env.PORT || 3000, ()=>{
    console.log('running on port 3000')
})