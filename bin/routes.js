/** *********************************************
*
*  This is where all the routes are. The setup that express 
*  generated seemed over-engineered.
*
************************************************ */


var express = require('express')
var router = express.Router();
let suds = require('../config/suds');

var csrf = require('csurf');
var csrfProtection = csrf();     //{ cookie: true } ??


router.get(`/`, async function (req, res) { require('../bin/cms/list-page')(req, res) });

router.get(`/page/:slug`, async function (req, res) { require('../bin/cms/list-page')(req, res) });

for (let key of Object.keys(suds.get)) {
  if (suds.csrf) {
    router.get(`/${key}`, csrfProtection, async function (req, res) {
      console.log('Routing GET with csrf to:', key);
      require(suds.get[key])(req, res)
    });
  }
  else {
    router.get(`/${key}`, async function (req, res) {
      console.log('Routing GET to:', key);
      require(suds.get[key])(req, res)
    });
  }
}

for (let key of Object.keys(suds.post)) {
  if (suds.csrf) {
    router.post(`/${key}`, csrfProtection, async function (req, res) {
         console.log('Routing POST with csrf to:', key);
      require(suds.post[key])(req, res)
    });
  }
  else {
         router.post(`/${key}`, async function (req, res) {
         console.log('Routing POST to:', key);
      require(suds.post[key])(req, res)
    });
   
  }
}


/* GET users listing.
router.get('/', async function (req, res, next) { res.render('index', { title: 'Admin', output: 'hello' }); });

router.post('/', function (req, res, next) { res.send(`<h1>Home page post</h1>`); });
*/
module.exports = router;
