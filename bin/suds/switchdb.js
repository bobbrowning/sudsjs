const trace = require('track-n-trace')
const sendView = require('./send-view')
const suds = require('../../config/suds')
const mergeAttributes = require('./merge-attributes') // Standardises attributes for a table, filling in any missing values with defaults
const db = require('./db') // Database routines

module.exports = async function (req, res) {
  const newdb = req.query.newdb
  mergeAttributes('clear-cache')
  try {
  suds.dbDriver = newdb
  }
  catch (err) {
    console.log(err)
    res.send (`Failed to connect to new database - 
    ${err}`)
  }
  await db.connect()
  res.send(`<p>Database switched to ${suds[newdb].friendlyName}. 
    <br />
    <a href="${suds.mainPage}">Administration page</a>
    <br />
    <a href="/">Home page</a>
    <br />
    <a href="/page/switchdb">Switch Database again</a>
    </p>`)
}
