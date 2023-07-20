"use strict";
/** *********************************************
*
*  This is where all the routes are. The setup that express
*  generated seemed over-engineered.
*
************************************************ */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const suds = require('../config/suds');
const trace = require('track-n-trace');
//const csrf = require('tiny-csrf')
//const csrfProtection = csrf()
router.get('/', async function (req, res) { require('../bin/cms/list-page')(req, res); });
router.get('/page/:slug', async function (req, res) { require('../bin/cms/list-page')(req, res); });
for (const key of Object.keys(suds.get)) {
    if (suds.csrf) {
        router.get(`/${key}`, /*csrfProtection, */ async function (req, res) {
            console.log('Routing GET with csrf to:', key);
            require(suds.get[key])(req, res);
        });
    }
    else {
        router.get(`/${key}`, async function (req, res) {
            console.log('Routing GET to:', key);
            require(suds.get[key])(req, res);
        });
    }
}
for (const key of Object.keys(suds.post)) {
    if (suds.csrf) {
        router.post(`/${key}`, /* csrfProtection,*/ async function (req, res) {
            console.log('Routing POST with csrf to:', key, req.body);
            require(suds.post[key])(req, res);
        });
    }
    else {
        router.post(`/${key}`, async function (req, res) {
            //       console.log('Routing POST to:', key)
            require(suds.post[key])(req, res);
        });
    }
}
/* GET users listing.
router.get('/', async function (req, res, next) { res.render('index', { title: 'Admin', output: 'hello' }) })

router.post('/', function (req, res, next) { res.send(`<h1>Home page post</h1>`) })
*/
module.exports = router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Jpbi9yb3V0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OzttREFLbUQ7O0FBSW5ELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNsQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFDdEMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBR3RDLG1DQUFtQztBQUNuQywrQkFBK0I7QUFJL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHLElBQUksT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFeEYsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHLElBQUksT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFbEcsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtJQUN0QyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDZCxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsb0JBQW9CLENBQUMsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO1lBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbEMsQ0FBQyxDQUFDLENBQUE7S0FDSDtTQUFNO1FBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztZQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ3RDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO0tBQ0g7Q0FDRjtBQUVELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDeEMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLG9CQUFvQixDQUFDLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztZQUNsRSxPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbkMsQ0FBQyxDQUFDLENBQUE7S0FDSDtTQUFNO1FBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztZQUM3Qyw2Q0FBNkM7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbkMsQ0FBQyxDQUFDLENBQUE7S0FDSDtDQUNGO0FBRUQ7Ozs7RUFJRTtBQUNGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFBIn0=