const { execute, executemany } = require('./postgres_connect')

async function get_mailbox (id, box) {
    queries = ["SELECT id, name FROM mail_user where id = $1;"]
    params = [[id]]

    if (box == "inbox") {
        queries.push("select m.sender_id, m.mail_num, m.time, m.subject, r.read, r.starred \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where (r.id = $1 or r.id in (select list_id from mailing_list where id = $1)) \
                    and time < (select now from now()) \
                    and not is_draft and not r.trashed and not r.deleted \
                    order by time desc;")
        params.push([id])
    }
    else if (box == "starred") {
        queries.push("select m.sender_id, m.mail_num, m.time, m.subject, r.read, r.starred \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where (r.id = $1 or r.id in (select list_id from mailing_list where id = $1)) \
                    and time < (select now from now()) \
                    and not is_draft and not r.trashed and not r.deleted and r.starred \
                    order by time desc;")
        params.push([id])
    }
    else if (box == "sent") {
        queries.push("select * from mail where sender_id = $1 and time < (select now from now()) \
                    and not is_draft and not trashed and not deleted \
                    order by time desc;")
        params.push([id])
    }
    else if (box == "drafts") {
        queries.push("select * from mail where sender_id = $1 and is_draft \
                    and not trashed and not deleted \
                    order by time desc;")
        params.push([id])
    }
    else if (box == "trash") {
        queries.push("select m.sender_id, m.mail_num, m.time, m.subject, r.read, r.starred \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where (r.id = $1 or r.id in (select list_id from mailing_list where id = $1)) \
                    and time < (select now from now()) \
                    and not is_draft and r.trashed and not r.deleted \
                    order by time desc;")
        params.push([id])
        queries.push("select * from mail where sender_id = $1 and trashed and not deleted \
                    order by time desc;")
        params.push([id])
    }
    else if (box == "scheduled") {
        queries.push("select * from mail where sender_id = $1 and time > (select now from now()) \
                    and not is_draft and not trashed and not deleted \
                    order by time desc;")
        params.push([id])
    }
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
    if (id === sender_id){
        queries = ["select * from mail where sender_id = $1 and mail_num = $2;"]
        params = [[sender_id, mail_num]]
    }
    else {
        try {
            queries = ["update recipient set read = 'true' where sender_id = $1 and mail_num = $2 and id = $3;"]
            params = [[sender_id, mail_num, id]]
            output = await execute(queries,params)
        } catch (error) {
            return [[{"status":"err_run_query"}]]
        }
        queries = ["select m.sender_id, m.mail_num, m.time, m.subject, m.content, r.is_cc, r.read, r.starred, r.trashed, r.deleted \
                    from mail as m join recipient as r using (sender_id, mail_num) \
                    where r.sender_id = $1 and r.mail_num = $2 and r.id = $3;"]
        params = [[sender_id, mail_num, id]]
    }
    try {
        output = await execute(queries,params)
        return output
    } catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function get_parent_mail (sender_id, mail_num) {
    queries = ["select * from mail where (sender_id, mail_num) = (select p_id, p_mail_num from reply where (id, mail_num) = ($1, $2));"]
    params = [[sender_id, mail_num]]
    try {
        output = await execute(queries,params)
        return output
    } catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function modify (id, sender_id, mail_num, mod){
    if (id == sender_id){
        queries = []
        params = []
        if (mod.s){
            queries.push("update mail set starred = $1 where sender_id = $2 and mail_num = $3")
            params.push([mod.s, sender_id, mail_num])
        }
        if (mod.t){
            queries.push("update mail set trashed = $1 where sender_id = $2 and mail_num = $3")
            params.push([mod.t, sender_id, mail_num])
        }
        if (mod.d){
            queries.push("update mail set deleted = $1 where sender_id = $2 and mail_num = $3")
            params.push([mod.d, sender_id, mail_num])
        }
        try {
            output = await execute(queries,params)
            return output
        } catch (error) {
            return [[{"status":"err_run_query"}]]
        }
    }
    else{
        queries = []
        params = []
        if (mod.s){
            queries.push("update recipient set starred = $1 where sender_id = $2 and mail_num = $3 and id = $4")
            params.push([mod.s, sender_id, mail_num, id])
        }
        if (mod.r){
            queries.push("update recipient set read = $1 where sender_id = $2 and mail_num = $3 and id = $4")
            params.push([mod.r, sender_id, mail_num, id])
        }
        if (mod.t){
            queries.push("update recipient set trashed = $1 where sender_id = $2 and mail_num = $3 and id = $4")
            params.push([mod.t, sender_id, mail_num, id])
        }
        if (mod.d){
            queries.push("update recipient set deleted = $1 where sender_id = $2 and mail_num = $3 and id = $4")
            params.push([mod.d, sender_id, mail_num, id])
        }
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
    queries.push("SELECT p_id, p_mail_num from reply where (id, mail_num) = ($1, $2);")
    params.push([id, mail_num])
    try {
        output = await execute(queries,params)
        return output
    }
    catch (error) {
        return [[{"status":"err_run_query"}]]
    }
}

async function get_new_reply(id, p_id, p_mn) {
    if (p_mn !== "0"){
        queries = ["SELECT * from mail where sender_id = $1 and mail_num = $2;"]
        params = [[p_id, p_mn]]
        queries.push("SELECT id from recipient where sender_id = $1 and mail_num = $2 and id != $3 and id != $4;")
        params.push([p_id, p_mn, id, p_id])
    }
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

async function send_mail (id, subject, content, to_recipients, cc_recipients, is_draft, is_scheduled, send_time, p_id, p_mn) {
    if (is_scheduled) {
        queries = ["INSERT into mail values ($1, 1+(select num_mails from mail_user where id=$2), $3, $4, $5, $6, $7, $8);"]
        params = [[id, id, send_time, subject, content, is_draft, false, false]]
    }
    else {
        queries = ["INSERT into mail values ($1, 1+(select num_mails from mail_user where id=$2), (select now from now()), $3, $4, $5, $6, $7);"]
        params = [[id, id, subject, content, is_draft, false, false]]
    }
    if (p_mn > 0) {
        queries.push("INSERT into reply values ($1, 1+(select num_mails from mail_user where id=$2), $3, $4);")
        params.push([id, id, p_id, p_mn])
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

module.exports = {
    get_mailbox,
    get_new_mails,
    get_mail,
    get_parent_mail,
    modify,
    get_draft,
    get_new_reply,
    delete_draft,
    send_mail
}
