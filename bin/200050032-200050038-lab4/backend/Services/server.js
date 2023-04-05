const port = 4000

const bcrypt = require("bcrypt")
const saltRounds = 10

// setting up express and sessions
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname))
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { query } = require("express")
app.use(cookieParser());
app.use(sessions({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    saveUninitialized: false,
    cookie: { maxAge: 1000*60*60*24},
    resave: false,
}));

// connect to postgres
const fs = require('fs')
config_file_data = fs.readFileSync(__dirname+"/../config.txt",)
const postgres_config = JSON.parse(config_file_data)
const { Pool } = require('pg')
const pool = new Pool(postgres_config)
pool.on('error',
    (err,client)=>{
        console.error("Postgres connection failed",err)
        process.exit(-1)
    }
)

const with_running_sem = 'with s1 as (select year, semester, start_time from reg_dates where start_time <= Now() at time zone \'Asia/Kolkata\'), '+
                        'running_sem as (select year, semester from s1 where start_time = (select max(start_time) from s1)) '

app.get('/logout',
    async (req,res)=>{
        req.session.destroy()
        res.end()
    }
)

app.get('/home',
    async (req,res)=>{
        id = req.session.user_id
        if (!id) {
            res.send([{ "id":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = 'select * from student where id=($1)'
                    params = [id]
                    result1 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{ "id":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem +
                            'select year, semester, course_id, title, credits, grade '+
                            'from takes join course using (course_id) '+
                            'where id=($1) and ((year,semester) = (select * from running_sem)) '+
                            'order by course.course_id'
                    params = [id]
                    result2 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{ "id":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem +
                                ',past_sems as (select distinct year, semester from takes '+
                                'where id=($1) and ((year,semester) != (select * from running_sem))) '+
                                'select * from past_sems '+
                                'order by year desc, 1*(semester = \'Summer\')::int +2*(semester = \'Fall\')::int +3*(semester = \'Winter\')::int desc'
                    params = [id]
                    result3 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{ "id":"-2"}])
                    process.exit(-1)
                }
                var past = []
                for (var i=0; i<result3.rows.length; i++) {
                    try {
                        my_query = 'select year, semester, grade, sec_id, course.* '+
                                    'from takes join course using (course_id) '+
                                    'where id=($1) and year=($2) and semester=($3) order by course.course_id'
                        params = [id,result3.rows[i].year,result3.rows[i].semester]
                        result4 = await client.query(my_query,params)
                        if (result4.rows.length>0) past.push(result4.rows)
                    }
                    catch{
                        client.release()
                        res.send([{ "id":"-2"}])
                        process.exit(-1)
                    }
                }
                output = [result1.rows[0],result2.rows,past]
                res.send(output)
                client.release()
            })
            .catch(err => {
                res.send([{ "id":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/course/:id',
    async (req,res)=>{
        course_id = req.params.id
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = 'select * from course where course_id=($1)'
                    params = [course_id]
                    result = await client.query(my_query,params)
                    var course_details = result.rows
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem+
                            'select * from course join section using (course_id) where course_id=($1) and (year,semester) = (select * from running_sem) order by sec_id'
                    params = [course_id]
                    result = await client.query(my_query,params)
                    var present_offerings = result.rows
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem+
                            'select * from course join section using (course_id) where course_id=($1) and (year,semester) != (select * from running_sem) '+
                            'order by year desc, 1*(semester = \'Summer\')::int +2*(semester = \'Fall\')::int +3*(semester = \'Winter\')::int desc, sec_id asc'
                    params = [course_id]
                    result = await client.query(my_query,params)
                    var past_offerings = result.rows
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                if (course_details.length==0) {
                    client.release()
                    res.send([{"status":"-3"}])
                }
                else{
                    for (var i=0;i<present_offerings.length;i++) {
                        try {
                            my_query = 'select i.id, i.name from instructor as i join teaches using (id) where course_id=($1) and sec_id=($2) and semester=($3) and year=($4) order by i.name'
                            params = [course_id,present_offerings[i].sec_id,present_offerings[i].semester,present_offerings[i].year]
                            result3 = await client.query(my_query,params)
                            present_offerings[i].instrs = result3.rows
                        }
                        catch (err) {
                            client.release()
                            res.send([{"status":"-2"}])
                            process.exit(-1)
                        }
                    }
                    for (var i=0;i<past_offerings.length;i++) {
                        try {
                            my_query = 'select i.id, i.name from instructor as i join teaches using (id) where course_id=($1) and sec_id=($2) and semester=($3) and year=($4) order by i.name'
                            params = [course_id,past_offerings[i].sec_id,past_offerings[i].semester,past_offerings[i].year]
                            result3 = await client.query(my_query,params)
                            past_offerings[i].instrs = result3.rows
                        }
                        catch (err) {
                            client.release()
                            res.send([{"status":"-2"}])
                            process.exit(-1)
                        }
                    }
                    my_query = 'select prereq_id, title from prereq as p join course as c on p.prereq_id=c.course_id where p.course_id=($1)'
                    params = [course_id]
                    return client.query(my_query,params)
                    .then(async prereqs => {
                        course_offerings = [present_offerings, past_offerings, prereqs.rows, course_details]
                        course_offerings.splice(0,0,{"status":"0"})
                        res.send(course_offerings)
                        client.release()
                    })
                    .catch(err => {
                        client.release()
                        res.send([{"status":"-2"}])
                        process.exit(-1)
                    })
                }
            })
            .catch(err => {
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }      
    }
)

app.get('/instr/:id',
    async (req,res)=>{
        instr_id = req.params.id
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = 'select name, dept_name from instructor where id=($1)'
                    params = [instr_id]
                    result1 = await client.query(my_query,params)
                    if (result1.rows.length == 0){
                        client.release()
                        res.send([{"status":"-3"}])
                    }
                    else{
                        try {
                            my_query = with_running_sem+
                                    'select c.course_id, c.title from course as c join teaches as t using (course_id) '+
                                    'where t.id = ($1) and (t.year, t.semester) = (select * from running_sem) '+
                                    'order by c.course_id asc'
                            params = [instr_id]
                            result2 = await client.query(my_query,params)
                        } catch (error) {
                            client.release()
                            res.send([{"status":"-2"}])
                            process.exit(-1)
                        }
                        try {
                            my_query = with_running_sem+
                                    'select t.year, t.semester, c.course_id, c.title from course as c join teaches as t using (course_id) '+
                                    'where t.id = ($1) and (t.year, t.semester) != (select * from running_sem) '+
                                    'order by t.year desc, 1*(t.semester = \'Summer\')::int +2*(t.semester = \'Fall\')::int +3*(t.semester = \'Winter\')::int desc, c.course_id asc'
                            params = [instr_id]
                            result3 = await client.query(my_query,params)
                            client.release()
                        } catch (error) {
                            client.release()
                            res.send([{"status":"-2"}])
                            process.exit(-1)
                        }
                        res.send([{"status":"0"},result1.rows,result2.rows,result3.rows])
                    }
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
            })
            .catch(err => {
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/running_courses',
    async (req,res)=>{
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = with_running_sem+
                                'select c.dept_name, count(*) from course as c join '+
                                '(select distinct course_id from section as s where (s.year,s.semester) = (select * from running_sem)) as s using (course_id) '+
                                'group by c.dept_name order by c.dept_name asc'
                    result = await client.query(my_query,[])
                    depts_list = result.rows
                    depts_list.splice(0,0,{"status":"0"})
                    res.send(depts_list)
                    client.release()
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/dept_courses/:dept_name',
    async (req,res)=>{
        dept_name = req.params.dept_name
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = with_running_sem+
                                'select c.course_id, c.title from course as c join '+
                                '(select distinct course_id from section as s where (s.year,s.semester) = (select * from running_sem)) as s using (course_id) '+
                                'where c.dept_name = ($1) '+
                                'order by c.course_id asc'
                    params = [dept_name]
                    result = await client.query(my_query,params)
                    dept_courses_list = result.rows
                    if (dept_courses_list.length==0) {
                        client.release()
                        res.send([{"status":"-3"}])
                    }
                    else{
                        dept_courses_list.splice(0,0,{"status":"0"})
                        res.send(dept_courses_list)
                    }
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/check_login',
    async (req,res)=>{
        if (req.session.user_id){
            pool.connect()
            .then(async client => {
                    my_query = 'select * from instructor where id = ($1)'
                    params = [id]
                    result0 = await client.query(my_query,params)
                    res.send([{ "status":"0","role":(result0.rows.length===0?"s":"i")}])
                    client.release()
            })
            .catch(err => {
                res.send({"login_status":"-5"})
                process.exit(-1)
            })
        }
        else res.send([{ "status":"-1"}])
    }
)

app.get('/reg_check_date',
    async (req,res)=>{
        pool.connect()
        .then(async client => {
            my_query = with_running_sem+', '+
                        'et as (select end_time from reg_dates where (year,semester) = (select * from running_sem)) '+
                        'select (select * from et) < Now() as status from running_sem'
            result = await client.query(my_query,[])
            // console.log(result.rows[0].status)
            res.send(result.rows)
        })
    }
)

app.get('/reg_search/:sub_str',
    async (req,res)=>{
        sub_str = req.params.sub_str
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = with_running_sem+
                                'select distinct c.course_id, c.title, c.dept_name, c.credits from course as c join section as s using (course_id) '+
                                'where (s.year,s.semester) = (select * from running_sem) and '+
                                '(c.course_id ilike \'%'+sub_str+'%\' or c.title ilike \'%'+sub_str+'%\')'
                    result = await client.query(my_query,[])
                    courses_list = result.rows
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                for (var i=0; i<courses_list.length; i++){
                    try {
                        my_query = with_running_sem+
                                    'select sec_id from section where course_id = ($1) and (year,semester) = (select * from running_sem) order by sec_id'
                        params = [courses_list[i].course_id]
                        result = await client.query(my_query,params)
                        courses_list[i].sections = result.rows
                    } catch (error) {
                        client.release()
                        res.send([{"status":"-2"}])
                        process.exit(-1)
                    }
                }
                courses_list.splice(0,0,{"status":"0"})
                res.send(courses_list)
                client.release()
            })
            .catch(err => {
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/reg_course/:course_id/:section_id',
    async (req,res)=>{
        var course_id = req.params.course_id
        var section_id = req.params.section_id
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = with_running_sem+
                                'select * from takes where id = ($1) and course_id = ($2)'
                    params = [id, course_id]
                    result1 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem+
                                '(select prereq_id from prereq where course_id = ($2)) except (select course_id from takes where id = ($1) and (year,semester) != (select * from running_sem))'
                    params = [id, course_id]
                    result2 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem+', '+
                                'slot as (select time_slot_id from section where course_id=($2) and sec_id=($3) and (year,semester) != (select * from running_sem)), '+
                                'slots as (select s.time_slot_id from takes as t natural join section as s where t.id = ($1) and (t.year,t.semester) = (select * from running_sem)) '+
                                'select * from slot intersect select * from slots'
                    params = [id, course_id, section_id]
                    result3 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    // console.log("Hello4")
                    process.exit(-1)
                }
                if (result1.rows.length>0) {
                    client.release()
                    res.send([{"status":"-3"}]) // course already registered
                }
                else if (result2.rows.length>0) {
                    client.release()
                    res.send([{"status":"-4"}]) // prereqs not satisfied
                }
                else if (result3.rows.length>0) {
                    client.release()
                    res.send([{"status":"-5"}]) // time slot clash
                }
                else{
                    try {
                        my_query = with_running_sem+
                                    'insert into takes (select $1, $2, $3, semester, year from running_sem)'
                        params = [id, course_id, section_id]
                        // console.log(section_id)
                        result = await client.query(my_query,params)
                    } catch (error) {
                        client.release()
                        res.send([{"status":"-2"}])
                        // console.log("Hello2",error)
                        process.exit(-1)
                    }
                    try {
                        my_query = with_running_sem+
                                    'update student set tot_cred = tot_cred + (select credits from course where course_id = ($2)) where id = ($1)'
                        params = [id, course_id]
                        result = await client.query(my_query,params)
                    } catch (error) {
                        client.release()
                        res.send([{"status":"-2"}])
                        // console.log("Hello1")
                        process.exit(-1)
                    }
                    res.send([{"status":"0"}])
                    client.release()
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                // console.log("Hello3")
                process.exit(-1)
            })
        }
    }
)

app.get('/drop/:c_id',
    async (req,res)=>{
        c_id = req.params.c_id
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(client => {
                my_query = with_running_sem+
                        'delete from takes where id=($1) and course_id=($2) and ((year,semester) = (select * from running_sem))'
                params = [id, c_id]
                return client.query(my_query,params)
                .then(result => {
                    my_query = 'update student set tot_cred = tot_cred - (select credits from course where course_id=($1)) where id=($2)'
                    params = [c_id, id]
                    return client.query(my_query,params)
                    .then(result => {
                        client.release()
                        res.send({"drop_status":"0"})
                    })
                    .catch(err => {
                        client.release()
                        res.send({"drop_status":"-2"})
                        process.exit(-1)
                    })
                })
                .catch(err => {
                    client.release()
                    res.send({"drop_status":"-2"})
                    process.exit(-1)
                })
            })
            .catch(err => {
                res.send({"drop_status":"-2"})
                process.exit(-1)
            })
        }
    }
)

app.post('/insert_user',
    async (req,res)=>{
        pool.connect()
        .then(client => {
            bcrypt.hash(req.body.password, saltRounds,
                (err,hashed_password)=>{
                    if (err) {
                        res.send(-1)
                        process.exit(-1)
                    }
                    else {
                        return client.query('INSERT INTO user_password (id, hashed_password) VALUES ($1,$2)',[req.body.user_id,hashed_password])
                        .then(result => {
                            client.release()
                            res.send("0")
                        })
                        .catch(err => {
                            client.release()
                            res.send("-2")
                            process.exit(-1)
                        })
                    }
                }
            )
        })
        .catch(err => {
            res.send("-3")
            process.exit(-1)
        })
    }
)

app.post('/login',
    async (req,res)=>{
        id = req.body.user_id
        pwd = req.body.password
        pool.connect()
        .then(client => {
            return client.query('SELECT hashed_password from user_password where id = $1',[id])
            .then(result => {
                if (result.rows.length == 0) {
                    client.release()
                    res.send({"login_status":"-2"})
                }
                else {
                    bcrypt.compare(pwd, result.rows[0].hashed_password,
                        async (err,match)=>{
                            if (err) {
                                res.send({"login_status":"-6"})
                                process.exit(-1)
                            }
                            else {
                                if (match) {
                                    try {
                                        my_query = 'select * from student where id = ($1)'
                                        params = [id]
                                        result1 = await client.query(my_query,params)
                                    } catch (error) {
                                        res.send({"login_status":"-4"})
                                        client.release()
                                        process.exit(-1)
                                    }
                                    try {
                                        my_query = 'select * from instructor where id = ($1)'
                                        params = [id]
                                        result2 = await client.query(my_query,params)
                                    } catch (error) {
                                        res.send({"login_status":"-3"})
                                        client.release()
                                        process.exit(-1)
                                    }
                                    if (result1.rows.length == 0 && result2.rows.length == 0) {
                                        res.send({"login_status":"-7"})
                                        client.release()
                                    }
                                    else{
                                        req.session.user_id = id
                                        req.session.save()
                                        client.release()
                                        res.send({"login_status":"0","role":(result1.rows.length==0?"i":"s")})
                                    }
                                }
                                else {
                                    res.send({"login_status":"-1"})
                                    client.release()
                                }
                            }
                        }
                    )
                }
                }
            )
        })
        .catch(err => {
            res.send({"login_status":"-5"})
            process.exit(-1)
        })
    }
)

// extra APIs

app.get('/all_courses',
    async (req,res)=>{
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = 'select * from course order by dept_name, course_id'
                    result = await client.query(my_query,[])
                    depts_list = result.rows
                    depts_list.splice(0,0,{"status":"0"})
                    res.send(depts_list)
                    client.release()
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/all_depts',
    async (req,res)=>{
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = 'select dept_name, building from department order by dept_name'
                    result = await client.query(my_query,[])
                    depts_list = result.rows
                    depts_list.splice(0,0,{"status":"0"})
                    res.send(depts_list)
                    client.release()
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/all_dept_courses/:dept_name',
    async (req,res)=>{
        dept_name = req.params.dept_name
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                try {
                    my_query = 'select * from course where dept_name = $1 order by course_id'
                    params = [dept_name]
                    result = await client.query(my_query,params)
                    depts_list = result.rows
                    depts_list.splice(0,0,{"status":"0"})
                    res.send(depts_list)
                    client.release()
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

// Instrutor APIs

app.get('/instr_home',
    async (req,res)=>{
        id = req.session.user_id
        instr_id = id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                my_query = 'select * from instructor where id = ($1)'
                params = [id]
                result0 = await client.query(my_query,params)
                if (result0.rows.length == 0){
                    res.send([{ "status":"-9"}])
                    client.release()
                }
                else{
                try {
                    my_query = 'select id, name, dept_name from instructor where id=($1)'
                    params = [instr_id]
                    result1 = await client.query(my_query,params)
                    if (result1.rows.length == 0){
                        client.release()
                        res.send([{"status":"-3"}])
                    }
                    else{
                        try {
                            my_query = with_running_sem+
                                    'select c.course_id, c.title from course as c join teaches as t using (course_id) '+
                                    'where t.id = ($1) and (t.year, t.semester) = (select * from running_sem) '+
                                    'order by c.course_id asc'
                            params = [instr_id]
                            result2 = await client.query(my_query,params)
                        } catch (error) {
                            client.release()
                            res.send([{"status":"-2"}])
                            process.exit(-1)
                        }
                        try {
                            my_query = with_running_sem+
                                    'select t.year, t.semester, c.course_id, c.title from course as c join teaches as t using (course_id) '+
                                    'where t.id = ($1) and (t.year, t.semester) != (select * from running_sem) '+
                                    'order by t.year desc, 1*(t.semester = \'Summer\')::int +2*(t.semester = \'Fall\')::int +3*(t.semester = \'Winter\')::int desc, c.course_id asc'
                            params = [instr_id]
                            result3 = await client.query(my_query,params)
                            client.release()
                        } catch (error) {
                            client.release()
                            res.send([{"status":"-2"}])
                            process.exit(-1)
                        }
                        res.send([{"status":"0"},result1.rows,result2.rows,result3.rows])
                    }
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                }
            })
            .catch(err => {
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)  

app.get('/all_students',
    async (req,res)=>{
        id = req.session.user_id
        if (!id) {
            res.send([{ "status":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                my_query = 'select * from instructor where id = ($1)'
                params = [id]
                result0 = await client.query(my_query,params)
                if (result0.rows.length == 0){
                    res.send([{ "status":"-9"}])
                    client.release()
                }
                else{
                try {
                    my_query = 'select * from student order by id::int'
                    result = await client.query(my_query,[])
                    depts_list = result.rows
                    depts_list.splice(0,0,{"status":"0"})
                    res.send(depts_list)
                    client.release()
                } catch (error) {
                    client.release()
                    res.send([{"status":"-2"}])
                    process.exit(-1)
                }
                }
            })
            .catch(err => {
                client.release()
                res.send([{"status":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.get('/student/:s_id',
    async (req,res)=>{
        id = req.session.user_id
        s_id = req.params.s_id
        if (!id) {
            res.send([{ "id":"-1"}])
        }
        else{
            pool.connect()
            .then(async client => {
                my_query = 'select * from instructor where id = ($1)'
                params = [id]
                result0 = await client.query(my_query,params)
                if (result0.rows.length == 0){
                    res.send([{ "id":"-9"}])
                    client.release()
                }
                else{
                try {
                    my_query = 'select * from student where id=($1)'
                    params = [s_id]
                    result1 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{ "id":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem +
                            'select year, semester, course_id, title, credits, grade '+
                            'from takes join course using (course_id) '+
                            'where id=($1) and ((year,semester) = (select * from running_sem)) '+
                            'order by course.course_id'
                    params = [s_id]
                    result2 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{ "id":"-2"}])
                    process.exit(-1)
                }
                try {
                    my_query = with_running_sem +
                                ',past_sems as (select distinct year, semester from takes '+
                                'where id=($1) and ((year,semester) != (select * from running_sem))) '+
                                'select * from past_sems '+
                                'order by year desc, 1*(semester = \'Summer\')::int +2*(semester = \'Fall\')::int +3*(semester = \'Winter\')::int desc'
                    params = [s_id]
                    result3 = await client.query(my_query,params)
                } catch (error) {
                    client.release()
                    res.send([{ "id":"-2"}])
                    process.exit(-1)
                }
                var past = []
                for (var i=0; i<result3.rows.length; i++) {
                    try {
                        my_query = 'select year, semester, grade, sec_id, course.* '+
                                    'from takes join course using (course_id) '+
                                    'where id=($1) and year=($2) and semester=($3) order by course.course_id'
                        params = [s_id,result3.rows[i].year,result3.rows[i].semester]
                        result4 = await client.query(my_query,params)
                        if (result4.rows.length>0) past.push(result4.rows)
                    }
                    catch{
                        client.release()
                        res.send([{ "id":"-2"}])
                        process.exit(-1)
                    }
                }
                output = [result1.rows[0],result2.rows,past]
                res.send(output)
                client.release()
                }
            })
            .catch(err => {
                res.send([{ "id":"-2"}])
                process.exit(-1)
            })
        }
    }
)

app.listen(port,
    ()=>{
        console.log("Server running on port %d",port);
    }
)
