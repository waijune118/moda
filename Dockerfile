FROM ubuntu:16.04

RUN apt-get update \
  && apt-get install -y postgresql postgresql-contrib curl \
  && curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apt-get install -y nodejs build-essential \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pm2


RUN mkdir /app && chown postgres:postgres /app
COPY . app
WORKDIR /app

ENV root_url= ROOT URL: 
ENV db_pass= DB USER PASSWORD: 
ENV session_secret= SESSIONS SECRET (RANDOM STRING): 
ENV port= PORT
ENV consumer_key= WP API CONSUMER KEY: 
ENV consumer_secret= WP API CONSUMER SECRET: 


RUN sed -i "s/moda_root_url/$root_url/g" public/index.html \
  && sed -i "s/moda_root_url/$root_url/g" public/js/app.js \
  && sed -i "s/moda_root_url/$root_url/g" routes/auth.js \
  && sed -i "s/db_password/$db_pass/g" helpers/db.js \
  && sed -i "s/app_port/$port/g" bin/www

USER postgres
WORKDIR /app
RUN npm i

RUN sudo bash -c "echo -e \"MODE=prod\nSECRET_KEY=$session_secret\nCONSUMER_KEY=$consumer_key\nCONSUMER_SECRET=$consumer_secret\nROOT_URL=$root_url\nDB_PASS=$db_pass\nAPP_PORT=$port\" > .env"

USER root
WORKDIR /app
ENTRYPOINT ["/bin/bash"]
CMD ["initdb.sh"]

EXPOSE 80
CMD ["npm", "start"]

