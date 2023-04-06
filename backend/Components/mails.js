const { execute, executemany } = require('./postgres_connect')

async function get_mailbox (id, box) {
    console.log("fetch mailbox request received", box)
    queries = ["SELECT id, name FROM mail_user where id = $1"]
    params = [[id]]
    if (box == "inbox") {
        queries.push("select m.sender_id, m.mail_num, time, subject, read, starred \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where r.id = $1 and time < (select now from now()) \
                    and not is_draft and not r.trashed and not r.deleted \
                    order by time desc;")
        params.push([id])
    }
    try {
        output = await execute(queries,params)
        return output
    } catch (error) {
        return [{"status":"err_run_query"}]
    }
}

module.exports = { get_mailbox }