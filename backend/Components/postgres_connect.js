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

async function run_query (query_string, params){
    try {
        client = await pool.connect()
        try {
            result = await client.query(query_string,params)
            console.log("Postgres query successful")
            client.release()
            output = [{"status":"0"}].concat(result.rows)
        } catch (error) {
            client.release()
            console.log("Postgres query failed:",error)
            return [{"status":"-1"}]
        }
    } catch (error) {
        console.log("Postgres client connect failed:",error)
        return [{"status":"-2"}]
    }
    return output
}

module.exports = { run_query }