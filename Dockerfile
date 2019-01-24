FROM ubuntu:xenial

RUN mkdir /app && chown postgres:postgres /app
COPY . app
WORKDIR /app

CMD ["install.sh"]
CMD ["initdb.sh"]
EXPOSE 80
CMD ["npm", "start"]

