/* *********************************************
*
*  This is where all the routes are. The setup that express 
*  generated seemed over-engineered.
*
************************************************ */


var express = require('express')
var router = express.Router();
let suds=require('../config/suds');


router.get (`/`,async function (req,res){require('../bin/suds/cms/list-page')(req,res)});

router.get (`/page/:slug`,async function (req,res){require('../bin/suds/cms/list-page')(req,res)});

for (let key of Object.keys(suds.get)) {
  router.get (`/${key}`,async function (req,res){require(suds.get[key])(req,res)});
}
for (let key of Object.keys(suds.post)) {
  router.post (`/${key}`,async function (req,res){
     console.log('Routing to:',key);
    require(suds.post[key])(req,res)
  });
}


/* GET users listing. */
router.get('/', async function(req, res, next) {res.render('index', { title: 'Admin' , output: 'hello'});});

router.post('/', function(req, res, next) { res.send(`<h1>Home page post</h1>`);});

module.exports = router;
