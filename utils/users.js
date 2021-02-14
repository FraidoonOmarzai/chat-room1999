const users = []

// adding new user
const addUser = ({id, username, room})=>{

    // clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return {
            error: 'Username and room name is required!'
        }
    }

    // check for existing user
    const existUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // validate username
    if(existUser){
        return{
            error: 'Username is in use!'
        }
    }

    // store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}


// removing user
const removeUser = (id) =>{
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}


const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUserInRoom = (room)=>{
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}