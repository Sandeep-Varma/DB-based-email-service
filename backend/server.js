const { execute, executemany } = require('./Components/postgres_connect')

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

app.get('/logout',
    async (req,res)=>{
        req.session.destroy()
        res.end()
    }
)

app.post('/login',
    async (req,res)=>{
        id = req.body.user_id
        pwd = req.body.password
        execute(["SELECT hashed_pwd FROM mail_user where id = $1"],[[id]])
        .then(output => {
            console.log(output)
            if (output[1].length == 0) {
                if (output[0].status == "0") res.send([{"status":"id_not_found"}])
                else res.send(output[0])
            }
            else {
                bcrypt.compare(pwd, output[0].hashed_password,
                    async (err,match)=>{
                        if (err) {
                            res.send([{"status":"err_password_hash_error"}])
                        }
                        else {
                            if (match) {
                                req.session.user_id = id
                                req.session.save()
                                res.send(output[0])
                            }
                            else {
                                res.send([{"status":"wrong_pwd"}])
                            }
                        }
                    }
                )
            }
            }
        )
        .catch(err => {
            res.send([{"status":"err_run_query"}])
        })
    }
)

app.post('/signup',
    async (req,res)=>{
        id = req.body.user_id
        pwd = req.body.password
        full_name = req.body.name
        execute(["SELECT * FROM mail_user where id = $1"],[[id]])
        .then(output => {
            console.log(output)
            if (output[1].length == 0) {
                if (output[0].status == "0"){
                    bcrypt.hash(pwd, saltRounds,
                        (err,hashed_pwd)=>{
                            if (err) {
                                res.send([{"status":"err_password_hash_error"}])
                            }
                            else {
                                execute(["insert into mail_user values ($1,$2,$3)"],[[id,hashed_pwd,full_name]])
                                .then(result => {
                                    req.session.user_id = id
                                    req.session.save()
                                    res.send(output[0])
                                })
                                .catch(err => {
                                    res.send([{"status":"err_run_query"}])
                                })
                            }
                        }
                    )
                }
                else res.send(output[0])
            }
            else res.send([{"status":"id_already_exists"}])
        })
        .catch(err => {
            res.send([{"status":"err_run_query"}])
        })
    }
)

app.get('/check_login',
    async (req,res)=>{
        if (req.session.user_id) res.send([{"status":"0"}])
        else res.send([{ "status":"not_logged_in"}])
    }
)

app.get('/home',
    async (req,res)=>{
        id = req.session.user_id
        if (id){
            queries = []
            params = []
            queries.push("SELECT * FROM mail_user where id = $1")
            params.push([id])
            queries.push("SELECT * FROM receiver where id = $1")
            params.push([id])
        }
        else res.send([{ "status":"not_logged_in"}])
    }
)

app.listen(port,
    ()=>{
        console.log("Server running on port %d",port);
    }
)