/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
const suds = require('../../../config/suds')
const trace = require('track-n-trace')
const db = require('../db')

module.exports = async function (req, res) {
  trace.log('#json called ', req.query)
  const table = req.query.table
  const fieldValue = req.query.value
  let obj
  try {
    obj = JSON.parse(fieldValue)
  } catch (err) {
    trace.log({ err: err.message, type: Array.isArray(err) })
    let more = ''
    const idx = err.message.match(/(position )([0-9]*)/)
    const pos = Number(idx[2])
    trace.log(pos)
    more = fieldValue.substring(pos - 8, pos + 8)
    return res.json([
      'validationError',
            `${err.message} - around this (<b>${more}</b>)`
    ])
  }
  trace.log(obj)
  return res.json(['OK'])
}
