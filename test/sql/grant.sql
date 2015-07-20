--REVOKE ALL PRIVILEGES ON DATABASE seo  FROM seouser;
CREATE USER webadministrator WITH PASSWORD 'feHfkeN2';
GRANT CREATE, CONNECT, TEMPORARY ON DATABASE seo TO webadministrator;
GRANT SELECT, UPDATE, INSERT,DELETE, TRUNCATE ON ALL TABLES in schema public TO webadministrator;
GRANT SELECT, USAGE  ON ALL SEQUENCES in schema public TO webadministrator;
/*
postgres://webadministrator:feHfkeN2@5.101.112.41:5432/seo
postgres://dturzjjeikfviy:nEeYyyz637YUbuONQfnSTjrEgD@ec2-54-204-27-32.compute-1.amazonaws.com:5432/d7ktj66106p6k8
*/