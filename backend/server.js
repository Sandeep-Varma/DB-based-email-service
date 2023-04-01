const { run_query } = require('./Components/postgres_connect')

const port = 4000

// setting up express
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname))

// setting up sessions
const cookieParser = require('cookie-parser')
const sessions = require('express-session');
app.use(cookieParser());
app.use(sessions({
    secret: 'thisismysecretkeyfhrgfgrfrty84fwir767',
    saveUninitialized: false,
    cookie: { maxAge: 1000*60*60*24},
    resave: false,
}));

// setting up bcrypt for password hashing
const bcrypt = require('bcrypt')
const saltRounds = 10

// app.get('/logout',
//     async (req,res)=>{
//         req.session.destroy()
//         res.end()
//     }
// )

// app.get('/login',
// )

// app.listen(port,
//     ()=>{
//         console.log("Server running on port %d",port);
//     }
// )

run_query("SELECT * FROM mail",[])
.then(
    result => {
        console.log(result)
    }
)
.catch(
    error => {
        console.log(error)
    }
)