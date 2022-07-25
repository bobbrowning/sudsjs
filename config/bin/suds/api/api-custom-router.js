/** ****************************************************
 * 
 *  Routes api request to rouine in the custom directory.
 *   The file name is the first parameter
 * 
 * *************************************************** */
 let suds = require('../../../config/suds');
 let trace = require('track-n-trace');
 let tableDataFunction = require('../table-data');
 let db = require('../' + suds.dbDriver);


async function apiCustomRouter (req, res) {

    trace.log({
        ip: req.ip,
        start: 'admin',
        query: req.query,
        body: req.body,
        files: req.files,
        break: '#',
        level: 'min',
 
    });
     trace.log({
        req: req,
        maxdepth: 4,
          });


    let allParms = req.query;
    trace.log(allParms.app);
    trace.log(allParms);
    let app=require(`../../custom/${allParms.app}.js`)
   result=await app(allParms);
    
   trace.log(result);

  
   return res.json(result);
}

module.exports = apiCustomRouter;