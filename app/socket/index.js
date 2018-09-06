const h = require('../helpers')

module.exports = (io, app) => {
  let allRooms = app.locals.chatrooms

  // allRooms.push({
  //   room: 'Good Food',
  //   roomID: '0001',
  //   users: []
  // })

  // allRooms.push({
  //   room: 'Cloud Computing',
  //   roomID: '0002',
  //   users: []
  // })

  io.of('/roomslist').on('connection', socket => {
    socket.on('getChatrooms', () => {
      socket.emit('chatRoomsList', JSON.stringify(allRooms))
    })

    socket.on('createNewRoom', newRoom => {
      // check to see if a room with the same title exists or not
      // if not, create one and broadcast it to everyone
      if(!h.findRoomByName(allRooms, newRoom)) {
        allRooms.push({
          room: newRoom,
          roomID: h.randomHex(),
          users: []
        })

        // Emit an updated list  to the creator
        socket.emit('chatRoomsList', JSON.stringify(allRooms))

        // Emit an updated list to everyone connected to the room page
        socket.broadcast.emit('chatRoomsList', JSON.stringify(allRooms))
      }

    })
    
  })

  io.of('/chatter').on('connection', socket => {
    // Join a chatroom
    socket.on('join', data => {
      let usersList = h.addUserToRoom(allRooms, data, socket)

      // update the list of active users as shown on the chatroom page
      socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users))
      // For the current user
      socket.emit('updateUsersList', JSON.stringify(usersList.users))
    })

    // When a users exits
    socket.on('disconnect', () => {
      // Find the room, to which the socket is conneted to and purge/remove the user
      let room = h.removeUserFromRoom(allRooms, socket)
      console.log('THis is called: ', room)
      socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users))
    })

    // When a new message arrives
    socket.on('newMessage', data => {
      console.log("Server: ", JSON.stringify(data))
      console.log('Socket: ', socket)
      socket.to(data.roomID).emit('inMessage', JSON.stringify(data))
    })
  })

}