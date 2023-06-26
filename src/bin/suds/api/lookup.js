/** ****************************************************
 *
 * automplete  response.
 * returns set of table rows depending on what has been typed in.
 * Input data
 *    - object: object to be searched
 *    - display: feld to display if no display function.
 *    - term
 *    - limit
 *    - andor
 *    - searchfield_1   (_2, _3 etc)
 *    - compare_1   (_2, _3 etc)
 *    - value_1   (_2, _3 etc)
 *
 *  If the term is numeric also looks for an exact match with
 *  the record key
 *
 * returns [labels, values] where labels and values
 * are matching arrays
 *
 * *************************************************** */
const suds = require('../../../config/suds')
const trace = require('track-n-trace')

module.exports = async function (req, res) {
  trace.log('#lookup called ', req.query)
  const allParms = req.query
  const source = allParms.linkedtable

  /**
     * Sort out the field to be displayed, or the function that returns the
     * displayed text.
     */
  const display = allParms.display
  const displayFunction = false
  const term = allParms.term
  const limit = Number(allParms.limit)
  trace.log({ source, term, limit })
  /**
     * Created the sort specification from the supplied data.
     */

  const labels = []
  const values = []
  const records = require(`../../../config/${source}`)

  const len = term.length
  let i = 0
  for (const key of Object.keys(records)) {
    trace.log(records[key], term, len)
    if (records[key].includes(term)) {
      trace.log('match')
      labels.push(records[key])
      values.push(key)
      if (i++ > limit) { break }
    }
  }

  const names = [labels, values]
  trace.log('#58 ', names)

  //  return array
  return res.json(names)
}
