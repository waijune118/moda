var dotenv = require('dotenv').config();
var promise = require('bluebird');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);

var connectionString = "";

connectionString = process.env.DATABASE_URL;

var db = pgp(connectionString);

module.exports = db;
