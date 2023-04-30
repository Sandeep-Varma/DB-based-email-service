const fs = require('fs')
const path = require('path')
// config_file_data = fs.readFileSync(__dirname+"/../config.txt",)
const config_file_path = path.join(__dirname, '../config.txt')
const config_file_data = fs.readFileSync(config_file_path, 'utf8')
const postgres_config = JSON.parse(config_file_data)
const { Pool } = require('pg')
const pool = new Pool(postgres_config)
pool.on('error',
    (err,client)=>{
        console.error("Postgres connection failed",err)
        process.exit()
    }
)

// execute each query in queries with corresponding params tuple in params
async function execute (queries, params){
    output = [[{"status":"0"}]]
    for (let i=0;i<queries.length;i++){
        try {
            result = await pool.query(queries[i],params[i])
            output = output.concat([result.rows])
        } catch (error) {
            console.log("Postgres query ",i+1," failed:",error)
            return [[{"status":"err_postgres_query"}]]
        }
    }
    return output
}

// same functionality as execute but if output is inconsistent, it executes again
async function consistent_execute (queries, params){
    output = await execute(queries,params)
    if (output.length !== 1+queries.length){
        output = await consistent_execute(queries,params)
    }
    return output
}

// execute a single query with each tuple in params
async function executemany (query, params){
    output = [[{"status":"0"}]]
    for (let i=0;i<params.length;i++){
        try {
            result = await pool.query(query,params[i])
            output = output.concat([result.rows])
        } catch (error) {
            console.log("Postgres query ",i," failed:",error)
            return [[{"status":"err_postgres_query"}]]
        }
    }
    return output
}

module.exports = {
    execute,
    consistent_execute,
    executemany
}