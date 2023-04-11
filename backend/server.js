const { execute, executemany } = require('./Components/postgres_connect')
const { get_mailbox, get_new_mails, get_received_mail, get_sent_mail, get_draft, send_mail } = require('./Components/mails')

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
        execute(["SELECT hashed_pwd FROM mail_user where id = $1 and num_mails != '-1'"],[[id]])
        .then(output => {
            console.log(output)
            if (output[1].length == 0) {
                if (output[0][0].status == "0") res.send([{"status":"id_not_found"}])
                else res.send(output[0])
            }
            else {
                bcrypt.compare(pwd, output[1][0].hashed_pwd,
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
        })
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
                if (output[0][0].status == "0"){
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
        if (req.session.user_id) res.send([[{"status":"0"}]])
        else res.send([[{ "status":"not_logged_in"}]])
    }
)

app.get('/mail/:box',
    async (req,res)=>{
        box = req.params.box
        id = req.session.user_id
        if (id){
            get_mailbox(id,box)
            .then(output => {
                res.send(output)
            })
            .catch(err => {
                res.send([[{"status":"err_fetching_mailbox"}]])
            })
        }
        else res.send([[{ "status":"not_logged_in"}]])
    }
)

app.post('/get_received_mail',
    async (req,res)=>{
        id = req.session.user_id
        sender_id = req.body.sender_id
        mail_num = req.body.mail_num
        if (id){
            get_received_mail(id,sender_id,mail_num)
            .then(output => {
                res.send(output)
            })
            .catch(err => {
                res.send([[{"status":"err_fetching_mail"}]])
            })
        }
        else res.send([[{ "status":"not_logged_in"}]])
    }
)

app.post('/get_sent_mail',
    async (req,res)=>{
        id = req.session.user_id
        mail_num = req.body.mail_num
        if (id){
            get_sent_mail(id,mail_num)
            .then(output => {
                res.send(output)
            })
            .catch(err => {
                res.send([[{"status":"err_fetching_mail"}]])
            })
        }
        else res.send([[{ "status":"not_logged_in"}]])
    }
)

app.get('/compose/:num',
    async (req,res)=>{
        id = req.session.user_id
        num = req.params.num
        if (id){
            if (num == "0") res.send([[{"status":"0"}]])
            else{
                get_draft(id,num)
                .then(output => {
                    res.send(output)
                })
                .catch(err => {
                    res.send([[{"status":"err_fetching_draft"}]])
                })
            }
        }
        else res.send([[{ "status":"not_logged_in"}]])
    }
)

app.get('/check_id/:id',
    async (req,res)=>{
        id = req.params.id
        execute(["SELECT * FROM mail_user where id = $1"],[[id]])
        .then(output => {
            console.log(output)
            if (output[1].length == 0) res.send([[{"status":"-1"}]])
            else res.send([[{"status":"0"}]])
        })
    }
)

app.post('/send_mail',
    async (req,res)=>{
        id = req.session.user_id
        to_recipients = req.body.to_recipients
        cc_recipients = req.body.cc_recipients
        subject = req.body.subject
        content = req.body.content
        is_draft = req.body.is_draft
        time = req.body.time
        if (id){
            send_mail(id,subject,content,to_recipients,cc_recipients,is_draft,time)
            .then(output => {
                res.send(output)
            })
            .catch(err => {
                res.send([[{"status":"err_sending_mail"}]])
            })
        }
        else res.send([[{ "status":"not_logged_in"}]])
    }
)

app.post('/mark_as_read',
    async (req,res)=>{
    }
)

app.post('/move_to_trash',
    async (req,res)=>{
    }
)

app.post('/mark_star',
    async (req,res)=>{
    }
)

app.post('/new_mailing_list',
    async (req,res)=>{
    }
)

app.post('/add_to_mailing_list',
    async (req,res)=>{
    }
)

app.listen(port,
    ()=>{
        console.log("Server running on port %d",port);
    }
)