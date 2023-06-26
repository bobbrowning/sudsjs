/* ****************************************
*
*  Validate the config file
*
**************************************** */
const trace = require('track-n-trace')
const suds = require('../../config/suds')
const lang = require('../../config/language').EN



module.exports = async function (msg) {
  let viewData = {}
  let time = new Date().getTime()
  let stack = new Error()
  console.log(`Error: ${time} ***** ${msg} *******`)
  viewData.output = `<h1>Ooops! - there has been a problem</h1>
  <H2>${msg}</h2>
  <p>${stack}</p>`
  viewData.footnote = lang.footnoteText
  viewData.heading = lang.homeHeading
  throw viewData
}
