
sudo apt-get update

apt-get install nodejs npm

sudo ln -s /usr/bin/nodejs /usr/bin/node (если не работает команда node)


sudo apt-get install postgresql postgresql-contrib

sudo -i -u postgres (заходим за postgres)

psql -p 5433 -U postgres  (проверяем, что база работает, порт)


выполнить файл server/db/postgres/migration/grant.sql (поменять что надо)

выполнить файл server/db/postgres/migration/1.sql

export DATABASE_URL=postgres://postgres@localhost:5433/seo (нужный порт и база)

git clone git@github.com:zmenka/SeoWorker.git

cd seo-worker

npm install bower -g

npm install

node server


-- запуск тестов
node ./node_modules/mocha/bin/mocha --timeout 150000 /home/abryazgin/www/fun/seo-worker/test/mocha/test.js

heroku ps:scale web=1 bg=0 --app=seoworker
heroku ps:scale web=0 bg=1 --app=seoworker-bg