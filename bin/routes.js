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
const csrf = require('csurf');
const csrfProtection = csrf();
router.get('/', async function (req, res) { require('../bin/cms/list-page')(req, res); });
router.get('/page/:slug', async function (req, res) { require('../bin/cms/list-page')(req, res); });
for (const key of Object.keys(suds.get)) {
    if (suds.csrf) {
        router.get(`/${key}`, csrfProtection, async function (req, res) {
            //   console.log('Routing GET with csrf to:', key)
            require(suds.get[key])(req, res);
        });
    }
    else {
        router.get(`/${key}`, async function (req, res) {
            //   console.log('Routing GET to:', key)
            require(suds.get[key])(req, res);
        });
    }
}
for (const key of Object.keys(suds.post)) {
    if (suds.csrf) {
        router.post(`/${key}`, csrfProtection, async function (req, res) {
            //       console.log('Routing POST with csrf to:', key)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Jpbi9yb3V0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OzttREFLbUQ7O0FBRW5ELE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNsQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUE7QUFFdEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzdCLE1BQU0sY0FBYyxHQUFHLElBQUksRUFBRSxDQUFBO0FBRTdCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRXhGLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRWxHLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFDdkMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7WUFDNUQsa0RBQWtEO1lBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO0tBQ0g7U0FBTTtRQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7WUFDNUMsd0NBQXdDO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO0tBQ0g7Q0FDRjtBQUVELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDeEMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLGNBQWMsRUFBRSxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7WUFDN0QsdURBQXVEO1lBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ25DLENBQUMsQ0FBQyxDQUFBO0tBQ0g7U0FBTTtRQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsRUFBRSxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7WUFDN0MsNkNBQTZDO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ25DLENBQUMsQ0FBQyxDQUFBO0tBQ0g7Q0FDRjtBQUVEOzs7O0VBSUU7QUFDRixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQSJ9