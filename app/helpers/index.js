const router = require('express').Router()
const db = require('../db')
const crypto = require('crypto')

let _registerRoutes = (routes, method) => {
    for(let key in routes) {
      if(typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
        _registerRoutes(routes[key], key)
      } else {
        if(method === 'get'){
          router.get(key, routes[key])
        } else if(method === 'post') {
          router.post(key, routes[key])
        }
        else {
          // console.log('Here', key)
          router.use(routes[key])
        }
      }
    }
}

let route = routes => {
  _registerRoutes(routes)
  return router;
}

// Find a single user based on a key
let findOne = profileID => {
  return db.userModel.findOne({
    'profileId': profileID
  })
}

// Create a new user and returns that instance
let createNewUser = profile => {
  return new Promise((resolve, reject) => {
    let newChatUser = new db.userModel({
      profileId: profile.id,
      fullName: profile.displayName,
      profilePic: profile.photos[0].value
    })

    newChatUser.save(error => {
      if(error) {
        // console.log('Ceate New User Error', error)
        reject(error)
      } else {
        resolve(newChatUser)
      }
    })
  })
}

let findById = id => {
  return new Promise((resolve, reject) => {
    db.userModel.findById(id, (error, user) => {
      if(error)
        reject(error)
      else
        resolve(user)
    })
  })
}

// A middleware that checks to see if the user is authenticated and logged in
let isAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/')
  }
}

// Find a chatoom by a given name
let findRoomByName = (allRooms, room) => {
  let findRoom = allRooms.findIndex((element, index, array) => {
    if(element.room.toLowerCase() === room.toLowerCase()){
      return true;
    }
    else {
      return false;
    }
  })

  return findRoom > -1?true: false
}

// Find a chatoom by a given name
let findRoomById = (allRooms, roomID) => {
  return allRooms.find((element, index, array) => {
    if(element.roomID === roomID)
      return true;
    else
      return false;
  })
}


// A function that generates a unique roomID
let randomHex = () => {
  return crypto.randomBytes(24).toString('hex')
}

// Add a user to a chatroom 
let addUserToRoom = (allRooms, data, socket) => {
  //Get the room object
  let getRoom = findRoomById(allRooms, data.roomID)

  if(getRoom !== undefined) {
    // Get the active user's ID (ObjectID as used in session)
    // console.log(socket.request.session)
    let userID = socket.request.session.passport.user
    // Check to see if user already exists in the chatroom
    let checkUser = getRoom.users.findIndex((element, index, array) => {
      if(element.userID == userID)
        return true;
      else
        return false;
    })

    // if the user is already present in the room, remove him first
    if(checkUser > -1) {
      getRoom.users.splice(checkUser, 1)
    }

    // Push the user into the room's users array
    getRoom.users.push({
      socketID: socket.id,
      userID,
      user: data.user,
      userPic: data.userPic
    })

    // Join the room channel
    socket.join(data.roomID)

    // Return the updated room object
    return getRoom;
  }
}

// Find and purge the user when a socket disconnects.
let removeUserFromRoom = (allRooms, socket) => {
  for(let room of allRooms) {
    // Find the User
    let findUser = room.users.findIndex((element, index, array) => {
      if(element.socketID === socket.id)
        return true
      else
        return false
    })

    if(findUser > -1) {
      socket.leave(room.roomID)
      room.users.splice(findUser, 1)
      return room
    }
  }
}

// module.exports.route = routes => {
//   _registerRoutes(routes)
//   return router;
// }

module.exports = {
  route,
  findOne,
  createNewUser,
  findById,
  isAuthenticated,
  findRoomByName,
  findRoomById,
  randomHex,
  addUserToRoom,
  removeUserFromRoom
}