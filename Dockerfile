FROM ubuntu:xenial

RUN mkdir /app
COPY . app
WORKDIR /app

RUN npm i

CMD ["install.sh"]
CMD ["initdb.sh"]
EXPOSE 80
CMD ["npm", "start"]

