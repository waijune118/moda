FROM ubuntu:16.04

RUN apt-get update \
  && apt-get install -y postgresql postgresql-contrib curl \
  && apt-get install -y  sudo \
  && apt-get install -y git \
  && curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apt-get install -y nodejs build-essential \
  && rm -rf /var/lib/apt/lists/*
  
RUN npm install -g pm2

RUN mkdir /app && chown postgres:postgres /app
COPY . /app
WORKDIR /app

RUN npm i


USER root
WORKDIR /app
RUN ["chmod", "+x", "/app/install.sh"]
RUN ["/app/install.sh"]


USER postgres
WORKDIR /app/moda-app
EXPOSE 80
CMD ["npm", "start"]
