#!/bin/bash

sudo apt-get update

sudo apt-get install -y postgresql postgresql-contrib
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -

sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
sudo npm install -g pm2

sudo apt-get autoremove -y



root_url=""
db_pass=123456
session_secret="&b\x98\xb9\x87jl\xf5\xe9\xe1h\x9d\x177x\x97\x8e\xe9\x8b\xc9O\xd7\x9b\x0f"
port=3000
consumer_key=K1ITZ0Jh6ZBG
consumer_secret=Q1da28SpvDKueYHzc3JmkoHQKtKyIhGvGLFjDE3r9SOKr0Zx

sudo groupadd --gid 5555 ubuntu
sudo useradd --uid 1111 --gid ubuntu --shell /bin/bash -m ubuntu

cd moda-app
sudo service postgresql start &&\
sudo -u postgres psql -c "CREATE USER ubuntu WITH PASSWORD '$db_pass';" &&\
sudo -u postgres bash -c "createdb modadb" &&\
sudo -u ubuntu psql -d modadb -c "CREATE TABLE modas ( 
   id SERIAL UNIQUE NOT NULL,
   user_id integer NOT NULL,
   data jsonb NOT NULL,
   deleted boolean DEFAULT false,
   date_added timestamp with time zone NOT NULL,
   collaborators jsonb,
   user_name text NOT NULL
);" &&\

sudo -u ubuntu psql -d modadb -c "CREATE TABLE users ( 
   id SERIAL UNIQUE NOT NULL,
   name text NOT NULL,
   email text NOT NULL,
   password text NOT NULL,
   org_name text,
   country text,
   role text DEFAULT 'contrib'::text NOT NULL,
   date_added timestamp with time zone NOT NULL,
   deleted boolean DEFAULT false,
   ext_id integer,
   token text,
   token_secret text
);"


sudo sed -i "s/moda_root_url/$root_url/g" public/index.html
sudo sed -i "s/moda_root_url/$root_url/g" public/js/app.js
sudo sed -i "s/moda_root_url/$root_url/g" routes/auth.js
sudo sed -i "s/db_password/$db_pass/g" helpers/db.js
sudo sed -i "s/app_port/$port/g" bin/www

npm install
sudo bash -c "echo -e \"MODE=prod\nSECRET_KEY=$session_secret\nCONSUMER_KEY=$consumer_key\nCONSUMER_SECRET=$consumer_secret\nROOT_URL=$root_url\nDB_PASS=$db_pass\nAPP_PORT=$port\" > .env"
#&b\x98\xb9\x87jl\xf5\xe9\xe1h\x9d\x177x\x97\x8e\xe9\x8b\xc9O\xd7\x9b\x0f

pm2 start npm --name "webapp" -- start
