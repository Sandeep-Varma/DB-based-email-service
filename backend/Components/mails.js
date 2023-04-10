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
    else if (box == "starred") {
        queries.push("select m.sender_id, m.mail_num, time, subject, read \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where r.id = $1 and time < (select now from now()) \
                    and not is_draft and not r.trashed and not r.deleted and starred \
                    order by time desc;")
        params.push([id])
    }
    // else if (box == "sent") {}
    // else if (box == "drafts") {}
    // else if (box == "trash") {}
    // else if (box == "scheduled") {}
    else return [[{"status":"invalid_box"}]]

    try {
        output = await execute(queries,params)
        return output
    } catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function get_new_mails (id, time) {
}

async function get_mail (id, sender_id, mail_num) {
}

async function send_mail (id, subject, content, recipients, is_draft, time) {
    
}

module.exports = { get_mailbox, get_new_mails, get_mail, send_mail }