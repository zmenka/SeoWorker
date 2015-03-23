

sudo add-apt-repository ppa:chris-lea/node.js ( если в репозитории нода старая)

sudo apt-get update

apt-get install nodejs npm

sudo ln -s /usr/bin/nodejs /usr/bin/node (если не работает команда node)

Альтернативный способ:

sudo apt-get update && apt-get install git-core curl build-essential openssl libssl-dev

git clone https://github.com/joyent/node.git

cd node

git checkout v0.10.28(последняя версия)

./configure --openssl-libpath=/usr/lib/ssl --without-snapshot

make

make test

make install

node -v # it's alive!
 
npm -v # it's alive!


http://www.pontikis.net/blog/postgresql-9-debian-7-wheezy

sudo apt-get install postgresql postgresql-contrib

su

passwd postgres (устанавливаем пароль для постргреса)

sudo -u postgres psql 

ИЛИ /etc/postgresql/9.4/main/pg_hba.conf md5->trust (чтобы давал запускать без пароля)

sudo /etc/init.d/postgresql restart

psql -p 5433 -U postgres  (проверяем, что база работает, порт)


выполнить файл server/db/postgres/migration/1.sql

export DATABASE_URL=postgres://postgres@localhost:5433/seo (нужный порт и база)

git clone https://github.com/bryazginnn/seo-worker.git

cd seo-worker

npm install

node server

http://help.friendsplus.me/article/56-i-am-getting-error-error-uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document



-- запуск тестов
node ./node_modules/mocha/bin/mocha --timeout 150000 /home/abryazgin/www/fun/seo-worker/test/mocha/test.js
