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

USER postgres
RUN npm i

ADD install.sh /moda-app/install.sh
CMD [./install.sh]


EXPOSE 80
CMD ["npm", "start"]

