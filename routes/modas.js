var express = require('express');
var router = express.Router();
var db = require('../helpers/db');
var multer = require('multer');
var authHelpers = require('../auth/_helpers');
var fs = require('fs');
var request = require('request');

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

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
var upload = multer({ storage: storage });

router.post('/', authHelpers.loginRequired, upload.single('file'), (req, res, next) => {
    var datenow = Date.now() / 1000;
    // var filepath = req.file ? req.file.path : null;
    db.one("INSERT INTO modas(user_id, user_name, date_added, data) VALUES($1, $2, to_timestamp($3), $4) RETURNING id", [parseInt(req.user.id), req.user.name, datenow, req.body.modajson])
    .then(function(data) {
        res.status(201).json({
            status: 'success',
            message: 'moda created',
            data: data
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});

router.post('/copy/:id', authHelpers.loginRequired, upload.single('file'), (req, res, next) => {
    var datenow = Date.now() / 1000;
    // var filepath = req.file ? req.file.path : null;
    db.none("INSERT INTO modas(user_name, user_id, date_added, data) SELECT $1, user_id, to_timestamp($2), data FROM modas WHERE id = $3", [req.user.name, datenow, parseInt(req.params.id)])
    .then(function() {
        res.status(201).json({
            status: 'success',
            message: 'moda copied'
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});

router.get('/usermodas/:offset(\\d+)', authHelpers.loginRequired, (req, res, next) => {
    var useremail = req.user.email;
    db.any('SELECT * FROM modas WHERE user_id=$1 OR collaborators->\'list\' @> ANY (ARRAY [\'[{"email":"' + useremail + '"}]\']::jsonb[]) ORDER BY deleted asc, date_added desc LIMIT 20 OFFSET $2', [parseInt(req.user.id), parseInt(req.params.offset)])
    .then(function(data) {
        res.status(200)
        .json({
            status: 'success',
            data: data
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});



router.get('/all/:offset(\\d+)', authHelpers.loginRequired, (req, res, next) => {
    // check if user is admin
    db.any('SELECT * FROM modas WHERE user_id=$1 ORDER BY date_added desc LIMIT 20 OFFSET $2', [parseInt(req.user.id), parseInt(req.params.offset)])
    .then(function(data) {
        res.status(200)
        .json({
            status: 'success',
            data: data
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});

router.get('/:id(\\d+)', (req, res, next) => {
    db.one('SELECT * FROM modas WHERE id = $1', parseInt(req.params.id))
    .then(function(data) {
        res.status(200)
        .json({
            status: 'success',
            data: data
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});

router.get('/access/:id(\\d+)', authHelpers.loginRequired, (req, res, next) => {
  var useremail = req.user.email;
  db.any('SELECT id FROM modas WHERE user_id=$1 OR collaborators->\'list\' @> ANY (ARRAY [\'[{"email":"' + useremail + '"}]\']::jsonb[])', [parseInt(req.user.id)])
  .then(function(data) {
      var i;
      var access = false;
      for (i = 0; i < data.length; i++) {
        if (parseInt(data[i]['id']) == (parseInt(req.params.id))) {
          access = true;
          res.status(200)
          .json({
              status: 'success',
              data: access
          });
        }
      }
      if (access == false) {
        res.status(200)
        .json({
            status: 'success',
            data: access
        });
      }
  })
  .catch(function(err) {
      handleErrResponse(res, 400, err.message);
  });
});

router.delete('/:id', authHelpers.loginRequired, (req, res, next) => {
    // db.none('UPDATE modas SET deleted = true WHERE user_id=$1 AND id = $2', [parseInt(req.user.id), parseInt(req.params.id)])
    db.none('DELETE FROM modas WHERE user_id=$1 AND id=$2', [parseInt(req.user.id), parseInt(req.params.id)])
    .then(function(data) {
        res.status(200)
        .json({
            status: 'success',
            data: 'moda deleted'
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});

router.post('/:id', authHelpers.loginRequired, upload.single('file'), (req, res, next) => {
    if (req.body.oldfilepath) {
        fs.unlink(req.body.oldfilepath, function(error) {
            if (error) {
                console.log(error);
            }
        });
    }
    if (req.file)
        filepath = req.file.path;
    else
        filepath = req.body.filepath;
    db.one('UPDATE modas SET data=$1 WHERE id=$2 RETURNING *', [req.body.modajson, parseInt(req.params.id)])
    .then(function(data) {
        res.status(200)
        .json({
            status: 'success',
            data: data
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 500, err.message);
    });
});

router.get('/collaborators/:query', (req, res, next) => {
    db.one('SELECT id, token, token_secret FROM users WHERE id = $1', req.user.id)
    .then(function(data) {
        var url = "https://emmc.info/wp-json/wp/v2/users?context=edit&search="+encodeURIComponent(req.params.query);
        var oauth = {
            consumer_key: consumer_k,
            consumer_secret: consumer_s,
            token: data.token,
            token_secret: data.token_secret
        }
        request.get({url:url, oauth:oauth, json:true}, function (e, r, data) {
            res.status(200)
            .json({
                data: data
            });
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 400, err.message);
    });
});


router.put('/:id/collaborators/', (req, res, next) => {
    db.none('UPDATE modas SET collaborators=$1 WHERE id=$2', [req.body.collaborators, parseInt(req.params.id)])
    .then(function() {
        res.status(200)
        .json({
            status: 'success'
        });
    })
    .catch(function(err) {
        handleErrResponse(res, 500, err.message);
    });
});


function handleErrResponse(res, code, msg) {
    res.status(code).json({ status: 'error', message: msg });
}

function capitalize(string) {
    var str = string.toLowerCase();
    if (str.indexOf(' ') > 0)
        str = str.substring(0, str.indexOf(' '));
    return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = router;
