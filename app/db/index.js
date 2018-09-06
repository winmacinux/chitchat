const config = require('../config')
const Mongoose = require('mongoose')
Mongoose.connect(config.dbURI, config.dbAuth)
const Schema = require('mongoose').Schema

// Mongoose.connection.on('error', error => {
//     console.log("Mongoose Error: ", error)
// })

const chatUser = new Schema({
    profileId: String,
    fullName: String,
    profilePic: String
})

let userModel = Mongoose.model('chatuser', chatUser)

module.exports  = {
    Mongoose,
    userModel
}