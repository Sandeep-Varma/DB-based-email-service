insert into takes values ('24746','679','1','Spring',2010,'A+');
update student set tot_cred = tot_cred + (select credits from course where course_id = '679');
