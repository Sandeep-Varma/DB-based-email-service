const fs = require('fs')
config_file_data = fs.readFileSync(__dirname+"/../config.txt",)
const postgres_config = JSON.parse(config_file_data)
const { Pool } = require('pg')
const pool = new Pool(postgres_config)
pool.on('error',
    (err,client)=>{
        console.error("Postgres connection failed",err)
        process.exit()
    }
)

async function execute (queries, params){
    try {
        client = await pool.connect()
        output = [[{"status":"0"}]]
        for (let i=0;i<queries.length;i++){
            try {
                result = await client.query(queries[i],params[i])
                client.release()
                output = output.concat([result.rows])
            } catch (error) {
                client.release()
                console.log("Postgres query ",i," failed:",error)
                return [{"status":"err_postgres_query"}]
            }
        }
        return output
    } catch (error) {
        console.log("Postgres client connect failed:",error)
        return [{"status":"err_postgres_connect"}]
    }
}

async function executemany (query, params){
    try {
        client = await pool.connect()
        output = [{"status":"0"}]
        for (let i=0;i<params.length;i++){
            try {
                result = await client.query(query,params[i])
                client.release()
                output = output.concat(result.rows)
            } catch (error) {
                client.release()
                console.log("Postgres query ",i," failed:",error)
                return [{"status":"err_postgres_query"}]
            }
        }
        return output
    } catch (error) {
        console.log("Postgres client connect failed:",error)
        return [{"status":"err_postgres_connect"}]
    }
}

module.exports = { execute, executemany }