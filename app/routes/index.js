const router = require('express').Router()
const h = require('../helpers')
const passport = require('passport')
const config = require('../config')

module.exports = () => {
  let routes = {
    'get': {
      '/': (req, res, next) => {
        res.render('login', { pageTitle: 'Chitchat Login'})
      },
      '/rooms': [ h.isAuthenticated, (req, res, next) => {
        res.render('rooms', { 
          pageTitle: 'All Rooms List',
          host: config.host,
          user: req.user
          // user: {
          //   fullName: "Ravi Sharma",
          //   profilePic: "https://www.ienglishstatus.com/wp-content/uploads/2018/04/Anonymous-Whatsapp-profile-picture.jpg"
          // }
        })
      }],
      '/chat/:id': [ h.isAuthenticated, (req, res, next) => {
        // Find a chatroom with the given id 
        // Render it if the id is found
        let getRoom =  h.findRoomById(req.app.locals.chatrooms, req.params.id)

        if(getRoom === undefined) {
          return next()
        } else {
          res.render('chat_room', {
            pageTitle: 'Chitchat Room',
            room: getRoom.room,
            roomID: getRoom.roomID,
            host: config.host,
            user: req.user
            // user: {
            //   fullName: "Ravi Sharma",
            //   profilePic: "https://www.ienglishstatus.com/wp-content/uploads/2018/04/Anonymous-Whatsapp-profile-picture.jpg"
            // }
          })
        }
      }],
      '/getSession': (req, res, next) => {
        res.send("My Favourite Color: ", req.session.favColor)
      },
      '/auth/facebook': passport.authenticate('facebook'),
      '/auth/facebook/callback': passport.authenticate('facebook', {
        successRedirect: '/rooms',
        failureRedirect: '/'
      }),
      '/auth/twitter': passport.authenticate('twitter'),
      '/auth/twitter/callback': passport.authenticate('twitter', {
        successRedirect: '/rooms',
        failureRedirect: '/'
      }),
      '/logout': (req, res, next) => {
        req.logout()
        res.redirect('/')
      }
    },
    'post': {

    },
    'NA': (rer, res, next) => {
      res.status(404).render('404')
    }
  }

  
  return h.route(routes)
  
}
