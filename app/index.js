console.log('Inside app')

// Social Authentication Logic
require('./auth')()

// Create an IO Server instance
let ioServer = app => {
  app.locals.chatrooms = []
  const server = require('http').Server(app)
  const io = require('socket.io')(server)
  // The bridge between express and socket which helping in getting the session access of the req without router(Used in registering the userId of the user for the room joining)
  io.use((socket, next) => {
    require('./session')(socket.request, {}, next)
  })
  require('./socket')(io, app)
  return server
}

module.exports = {
  router: require('./routes')(),
  session: require('./session'),
  ioServer
}
