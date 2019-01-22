FROM ubuntu:xenial

RUN apt-get update \
  && apt-get install -y postgresql postgresql-contrib curl \
  && curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apt-get install -y nodejs build-essential \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pm2

RUN mkdir /app && chown postgres:postgres /app
COPY . app
WORKDIR /app

ENV root_url moda
ENV db_pass secret
ENV port 5000
ENV session_secret ssecret
ENV consumer_key ckey
ENV consumer_secret csecret

RUN sed -i "s/moda_root_url/$root_url/g" public/index.html \
  && sed -i "s/moda_root_url/$root_url/g" public/js/app.js \
  && sed -i "s/moda_root_url/$root_url/g" routes/auth.js \
  && sed -i "s/db_password/$db_pass/g" helpers/db.js \
  && sed -i "s/app_port/$port/g" bin/www

USER postgres
WORKDIR /app
RUN npm install

USER root
WORKDIR /app
ENTRYPOINT ["/bin/bash"]
CMD ["initdb.sh"]
EXPOSE 80

