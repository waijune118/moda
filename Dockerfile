FROM ubuntu:16.04

RUN apt-get update \
  && apt-get install -y postgresql postgresql-contrib curl \
  && apt-get install -y  sudo \
  && curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apt-get install -y nodejs build-essential \
  && rm -rf /var/lib/apt/lists/*
  
RUN npm install -g pm2

RUN mkdir /app && chown postgres:postgres /app
COPY . /app
WORKDIR /app

RUN npm i

RUN useradd -m root && echo "root:root" | chpasswd && adduser root sudo
USER root
WORKDIR /app
RUN ["chmod", "+x", "/app/install.sh"]
RUN ["/app/install.sh"]


USER postgres
EXPOSE 80
CMD ["npm", "start"]

