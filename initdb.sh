#!/bin/bash
service postgresql start
echo "psql -c \"CREATE USER ubuntu WITH PASSWORD 'secret';\"" | su postgres
echo "createdb modadb" | su postgres
echo "psql -d modadb -c \"CREATE TABLE IF NOT EXISTS modas (id SERIAL UNIQUE NOT NULL, user_id integer NOT NULL, data jsonb NOT NULL, deleted boolean DEFAULT false, date_added timestamp with time zone NOT NULL, collaborators jsonb, user_name text NOT NULL);\"" | su postgres
echo "psql -d modadb -c \"CREATE TABLE IF NOT EXISTS users (id SERIAL UNIQUE NOT NULL, name text NOT NULL, email text NOT NULL, password text NOT NULL, org_name text, country text, role text DEFAULT 'contrib'::text NOT NULL, date_added timestamp with time zone NOT NULL, deleted boolean DEFAULT false, ext_id integer, token text, token_secret text);\"" | su postgres

#echo "pm2 start npm --name \"webapp\" -- start" | su postgres
echo "pm2 start app.js" | su postgres
#echo "npm app.js" | su postgres
