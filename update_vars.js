var fs = require('fs')
var dotenv = require('dotenv').config();
var root_url = process.env.ROOT_URL;
var db_pass = process.env.DB_PASS;
var app_port = process.env.APP_PORT;


if(process.argv[2] == 'r'){
	revert();
} else {
	update();
}

function update(){
	console.log('UPDATING...');

	fs.readFile('public/index.html', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		if(root_url)
			var result = data.replace(/moda_root_url/g, root_url);
		else
			var result = data.replace(/moda_root_url\//g, root_url);

		fs.writeFile('public/index.html', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});

	fs.readFile('public/js/app.js', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		if(root_url)
			var result = data.replace(/moda_root_url/g, root_url);
		else
			var result = data.replace(/\/moda_root_url/g, root_url);
		fs.writeFile('public/js/app.js', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});

	fs.readFile('routes/auth.js', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var result = data.replace(/moda_root_url/g, root_url);
		fs.writeFile('routes/auth.js', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});

	if(db_pass)
		fs.readFile('helpers/db.js', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(/db_password/g, db_pass);
			fs.writeFile('helpers/db.js', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
		});

	fs.readFile('bin/www', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var result = data.replace(/app_port/g, app_port);
		fs.writeFile('bin/www', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
}

function revert(){
	console.log('REVERTING...');

	fs.readFile('public/index.html', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		if(root_url)
			var replace1 = 'href="\/'+root_url+'\/"';
		else
			var replace1 = 'href="\/'+root_url+'"';
		var re1 = new RegExp(replace1,"g");
		var result1 = data.replace(re1, 'href="/moda_root_url/"');

		if(root_url)
			var replace2 = root_url+'\/js\/\_lib\/viz\-lite';
		else
			var replace2 = 'js\/\_lib\/viz\-lite';
		var re2 = new RegExp(replace2,"g");

		var result2 = result1.replace(re2, 'moda_root_url/js/_lib/viz-lite');
		fs.writeFile('public/index.html', result2, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});


	fs.readFile('public/js/app.js', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		if(root_url)
			var replace = 'baseUrl: \'\/'+root_url+'\/api\'';
		else
			var replace = 'baseUrl: \''+root_url+'\/api\'';
		var re = new RegExp(replace,"g");
		var result = data.replace(re, 'baseUrl: \'/moda_root_url/api\'');
		fs.writeFile('public/js/app.js', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});

	fs.readFile('routes/auth.js', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var replace = 'res\.redirect\\(\'\/'+root_url+'\'\\)';
		var re = new RegExp(replace,"g");
		var result = data.replace(re, 'res.redirect(\'\/moda_root_url\')');
		fs.writeFile('routes/auth.js', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});

	
	fs.readFile('helpers/db.js', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var replace = 'postgres\:\/\/ubuntu:'+db_pass+'\@';
		var re = new RegExp(replace,"g");
		var result = data.replace(re, 'postgres\:\/\/ubuntu:db_password\@');
		fs.writeFile('helpers/db.js', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});

	fs.readFile('bin/www', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var replace = 'normalizePort\\(\''+app_port+'\'\\)';
		var re = new RegExp(replace,"g");
		var result = data.replace(re, 'normalizePort(\'app_port\')');
		fs.writeFile('bin/www', result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
}