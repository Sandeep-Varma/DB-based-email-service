drop table if exists attachment;
drop table if exists reply;
drop table if exists mailing_list;
drop table if exists recipient;
drop table if exists mail;
drop table if exists mail_user;
drop table if exists mail_admin;

create table mail_admin(
    id varchar(25) not null,
    hashed_pwd varchar(80) not null,
    primary key(id)
);

create table mail_user(
    id varchar(25),
    hashed_pwd varchar(80) not null,
    name varchar(40) not null,
    profile_pic varchar(30),
    num_mails int not null default 0 check (num_mails >= 0),
    -- number of mails sent by the user
    -- or is -1 for a mailing list
    primary key(id)
);

create table mail(
    sender_id varchar(25) not null,
    mail_num int not null,
    time timestamptz not null,
    subject varchar(200),
    content varchar(1000), ---------------------------- or text?
    is_draft boolean not null default false,
    starred boolean not null default false,
    trashed boolean not null default false,
    -- in trash of sender
    deleted boolean not null default false,
    -- deleted permanently
    primary key(sender_id, mail_num),
    foreign key(sender_id) references mail_user(id)
);

create table recipient(
    sender_id varchar(25) not null,
    mail_num int not null,
    id varchar(25) not null,
    is_cc boolean not null default false,
    read boolean not null default false,
    starred boolean not null default false,
    trashed boolean not null default false,
    -- in trash of recipient
    deleted boolean not null default false,
    -- deleted permanently
    primary key(sender_id, mail_num, id),
    foreign key(sender_id, mail_num) references mail(sender_id, mail_num) on delete cascade,
    foreign key(id) references mail_user(id)
);

create table mailing_list(
    id varchar(25) not null,
    list_id varchar(25) not null,
    primary key(id, list_id),
    foreign key(id) references mail_user(id),
    foreign key(list_id) references mail_user(id)
);

create table reply(
    id varchar(25) not null,
    mail_num int not null,
    p_id varchar(25) not null,
    p_mail_num int not null,
    primary key(id, mail_num),
    foreign key(id, mail_num) references mail(sender_id, mail_num) on delete cascade,
    foreign key(p_id, p_mail_num) references mail(sender_id, mail_num)
);

create table attachment(
    sender_id varchar(25) not null,
    mail_num int not null,
    att_num int not null check (att_num >= 0),
    file_id varchar(30) not null,
    primary key(sender_id, mail_num, att_num),
    foreign key(sender_id, mail_num) references mail(sender_id, mail_num)
);

