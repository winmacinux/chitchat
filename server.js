const express = require('express')
let app = express()
const bodyParser = require('body-parser')
const chitChat = require('./app')
const passport = require('passport')


app.use(bodyParser.json())

app.use(express.static('public'))

app.set('port', process.env.PORT || 8088)
app.set('view engine', 'ejs')

// This is default. No need to add this statement. (For Knowledge Only)
// app.set('views', './views')

app.use(chitChat.session)
app.use(passport.initialize())
app.use(passport.session())

app.use('/', chitChat.router)

chitChat.ioServer(app).listen(app.get('port'), () => {
  console.log('Server is running at port ', app.get('port'))
})