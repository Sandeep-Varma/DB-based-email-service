const { execute, executemany } = require('./postgres_connect')

async function get_mailbox (id, box) {
    queries = ["SELECT id, name FROM mail_user where id = $1;"]
    params = [[id]]

    if (box == "inbox") {
        queries.push("select m.sender_id, m.mail_num, time, subject, read, r.starred \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where (r.id = $1 or r.id in (select list_id from mailing_list where id = $1)) \
                    and time < (select now from now()) \
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

async function get_received_mail (id, sender_id, mail_num) {
    queries = ["update recipient set read = 'true' where sender_id = $1 and mail_num = $2 and id = $3;"]
    params = [[sender_id, mail_num, id]]
    queries.push("select m.time, m.subject, m.content, r.is_cc, r.read, r.starred, r.trashed, r.deleted \
                from mail as m join recipient as r using (sender_id, mail_num) \
                where r.sender_id = $1 and r.mail_num = $2 and r.id = $3;")
    params.push([sender_id, mail_num, id])
    try {
        output = await execute(queries,params)
        return output
    } catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function get_sent_mail (id, sender_id, mail_num) {
}

async function modify (id, sender_id, mail_num, starred, is_read){
    if (id == sender_id){
        queries = ["update mail set starred = $1 where sender_id = $2 and mail_num = $3"]
        params = [[starred, sender_id, mail_num]]
        try {
            output = await execute(queries,params)
            return output
        } catch (error) {
            return [[{"status":"err_run_query"}]]
        }
    }
    else{
        queries = ["update recipient set starred = $1, read = $2 where sender_id = $3 and mail_num = $4 and id = $5"]
        params = [[starred, is_read, sender_id, mail_num, id]]
        try {
            output = await execute(queries,params)
            return output
        } catch (error) {
            return [[{"status":"err_run_query"}]]
        }
    }
}

async function get_draft(id, mail_num) {
    queries = ["SELECT * from mail where sender_id = $1 and mail_num = $2 and is_draft is true;"]
    params = [[id, mail_num]]
    queries.push("SELECT id from recipient where sender_id = $1 and mail_num = $2 and is_cc is false;")
    params.push([id, mail_num])
    queries.push("SELECT id from recipient where sender_id = $1 and mail_num = $2 and is_cc is true;")
    params.push([id, mail_num])
    try {
        output = await execute(queries,params)
        return output
    }
    catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function delete_draft(id, mail_num) {
    queries = ["DELETE from mail where sender_id = $1 and mail_num = $2;"]
    params = [[id, mail_num]]
    try {
        output = await execute(queries,params)
        return output
    }
    catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function send_mail (id, subject, content, to_recipients, cc_recipients, is_draft, is_scheduled, send_time) {
    if (is_scheduled) {
        queries = ["INSERT into mail values ($1, 1+(select num_mails from mail_user where id=$2), $3, $4, $5, $6, $7, $8);"]
        params = [[id, id, send_time, subject, content, is_draft, false, false]]
    }
    else {
        queries = ["INSERT into mail values ($1, 1+(select num_mails from mail_user where id=$2), (select now from now()), $3, $4, $5, $6, $7);"]
        params = [[id, id, subject, content, is_draft, false, false]]
    }
    queries.push("UPDATE mail_user set num_mails = 1+(select num_mails from mail_user where id=$1) where id=$1;")
    params.push([id])
    for (recipient of to_recipients) {
        queries.push("INSERT into recipient values ($1, (select num_mails from mail_user where id=$2), $3, $4, $5, $6, $7, $8);")
        params.push([id, id, recipient, false, false, false, false, false])
    }
    for (recipient of cc_recipients) {
        queries.push("INSERT into recipient values ($1, (select num_mails from mail_user where id=$2), $3, $4, $5, $6, $7, $8);")
        params.push([id, id, recipient, true, false, false, false, false])
    }
    try {
        output = await execute(queries,params)
        return output
    } catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

module.exports = { get_mailbox, get_new_mails, get_received_mail, get_sent_mail, modify, get_draft, delete_draft, send_mail }