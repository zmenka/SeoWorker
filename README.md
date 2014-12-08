sudo add-apt-repository ppa:chris-lea/node.js ( если в репозитории нода старая)

sudo apt-get update

apt-get install nodejs npm

sudo ln -s /usr/bin/nodejs /usr/bin/node (если не работает команда node)

sudo apt-get install postgresql postgresql-contrib

su

passwd postgres (устанавливаем пароль для постргреса)

/etc/postgresql/9.4/main/pg_hba.conf md5->trust (чтобы давал запускать без пароля)

sudo /etc/init.d/postgresql restart

psql -p 5433 -U postgres  (проверяем, что база работает, порт)

выполнить файл server/db/postgres/migration/1.sql

export DATABASE_URL=postgres://postgres@localhost:5433/seo (нужный порт и база)

git clone https://github.com/bryazginnn/seo-worker.git

cd seo-worker

npm install

node start
