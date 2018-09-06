const passport = require('passport')
const config = require('../config')
const h = require('../helpers')
const FacebookStrategy = require('passport-facebook').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

module.exports = () => {

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        h.findById(id).then(user => done(null, user)).catch(error => console.log('Error when deserialing the user: ', error))
    })

    let authProcessor =  (accessToken, refreshToken, profile, done) => {
        // Find the user in the local db using profile.id
        // If the user is found return the user data using the data()
        // If the user is not found, create one in the local db and return
        h.findOne(profile.id).then(result => {
            if(result) {
              console.log('Previous User.')
                done(null, result)
            } else{
                // Case 3: Create a new user and return 
                h.createNewUser(profile).then(newChatUser => done(null, newChatUser)).catch(error => console.log('Error when creating new user', error))
            }
        })
    }

    passport.use(new FacebookStrategy(config.fb, authProcessor))
    passport.use(new TwitterStrategy(config.twitter, authProcessor))
}