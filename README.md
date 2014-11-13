apt-get install nodejs npm

sudo ln -s /usr/bin/nodejs /usr/bin/node 

sudo apt-get install postgresql postgresql-contrib

su

passwd postgres

/etc/postgresql/9.4/main/pg_hba.conf md5->trust

sudo /etc/init.d/postgresql restart

psql -p 5433 -U postgres 


git clone https://github.com/bryazginnn/seo-worker.git

cd seo-worker

npm install

node start
