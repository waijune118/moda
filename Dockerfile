FROM ubuntu:16.04



RUN mkdir /app && chown postgres:postgres /app
COPY . app
WORKDIR /app

USER postgres
RUN npm i

CMD ["initdb.sh"]
CMD ["install.sh"]

EXPOSE 80
CMD ["npm", "start"]

