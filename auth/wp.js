var passport = require('passport');
var OAuth1Strategy = require('passport-oauth1').Strategy;
var db = require('../helpers/db');
var init = require('./passport');
var request = require('request');

init();

var consumer_k = '', consumer_s = '', callback_url = '';
if(process.env.MODE == 'prod'){
	consumer_k = process.env.CONSUMER_KEY;
	consumer_s = process.env.CONSUMER_SECRET;
	callback_url = "https://data1.iwm.fraunhofer.de/moda/api/auth/wordpress/callback/";
} else if(process.env.MODE == 'dev') {
	consumer_k = process.env.DEV_CONSUMER_KEY;
	consumer_s = process.env.DEV_CONSUMER_SECRET;
	callback_url = "http://localhost:3000/api/auth/wordpress/callback/";
} else if(process.env.MODE == 'katest') {
	consumer_k = process.env.KAT_CONSUMER_KEY;
	consumer_s = process.env.KAT_CONSUMER_SECRET;
	callback_url = "https://data1.iwm.fraunhofer.de/moda_katest/api/auth/wordpress/callback/";
} else {
	consumer_k = process.env.TEST_CONSUMER_KEY;
	consumer_s = process.env.TEST_CONSUMER_SECRET;
	callback_url = "https://data1.iwm.fraunhofer.de/moda_test/api/auth/wordpress/callback/";
}

passport.use(new OAuth1Strategy({
	requestTokenURL: 'https://emmc.info/oauth1/request',
	accessTokenURL: 'https://emmc.info/oauth1/access',
	userAuthorizationURL: 'https://emmc.info/oauth1/authorize',
	consumerKey: consumer_k,
	consumerSecret: consumer_s,
	callbackURL: callback_url
}, function(token, tokenSecret, profile, done) {
	var oauth = {
		consumer_key: consumer_k,
		consumer_secret: consumer_s,
		token: token,
		token_secret: tokenSecret
	},

	url = 'https://emmc.info/wp-json/wp/v2/users/me?context=edit';
	request.get({url:url, oauth:oauth, json:true}, function (e, r, user) {
		db.one('SELECT * FROM users WHERE email = $1', [user.email])
		.then(function(localuser) {
			return done(null, localuser);
		})
		.catch(function(error) {
			if(error.message == "No data returned from the query."){
				var datenow = Date.now() / 1000;
				db.one("INSERT INTO users(name, email, password, country, ext_id, date_added, token, token_secret) VALUES($1, $2, $3, $4, $5, to_timestamp($6), $7, $8) RETURNING *", [user.name, user.email, tokenSecret, user.locale, user.id, datenow, token, tokenSecret])
				.then(function(newuser) {
					return done(null, newuser);
				})
				.catch(function(err) {
					return done(err, null);
				});

			} else {
				return done(error, null);
			}
		});
	})
}));

module.exports = passport;
