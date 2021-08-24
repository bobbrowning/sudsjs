/* *********************************************
*
*  This is where all the routes are. The setup that express 
*  generated seemed over-engineered.
*
************************************************ */


var express = require('express')
var router = express.Router();
let suds=require('../config/suds');


for (let key of Object.keys(suds.get)) {
  router.get (`/${key}`,async function (req,res){require(suds.get[key])(req,res)});
}
for (let key of Object.keys(suds.post)) {
  console.log('post',key,suds.post[key]);
  router.post (`/${key}`,async function (req,res){require(suds.post[key])(req,res)});
}
/*
let admin = require('../bin/suds/admin');
let register = require('../bin/suds/register');
let registerProcess = require('../bin/suds/register-process');
let createTable = require('../bin/suds/create-table');
let validateConfig = require('../bin/suds/validateconfig');
let configReport = require('../bin/suds/configreport');
let logout = require('../bin/suds/logout');
let loginProcess = require('../bin/suds/login-process');
let autocomplete = require('../bin/suds/autocomplete');
let forgotten = require('../bin/suds/forgotten');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });

router.get('/changepw', async function (req, res) {require('../bin/suds/change-password')(req,res);});
let changePasswordProcess = require('../bin/suds/change-password-process');
router.post('/changepw', async function (req, res) {changePasswordProcess(req,res);});
router.get('/auto', async function (req, res) {autocomplete(req,res);});
router.get('/validate-config', async function (req, res) {validateConfig(req,res);});
router.get('/config-report', async function (req, res) {configReport(req,res);});
router.get('/create-table', async function (req, res) {createTable(req,res);});
router.get('/register', async function (req, res) { register(req,res);});
router.post('/register', async function (req, res) {registerProcess(req,res);});

//router.get('/login'\\, async function (req, res) {require('../bin/suds/login')(req,res);});


router.post('/login', async function (req, res) {loginProcess(req,res);});
router.get('/logout', async function (req, res) {logout(req,res);});


router.get('/admin', async function (req, res) {admin(req,res);});
router.post('/admin', async function (req, res) {admin(req,res);});
*/

/* GET users listing. */
router.get('/', async function(req, res, next) {res.render('index', { title: 'Admin' , output: 'hello'});});

router.post('/', function(req, res, next) { res.send(`<h1>Home page post</h1>`);});

module.exports = router;
