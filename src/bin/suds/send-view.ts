
const trace = require('track-n-trace')
const suds = require('../../config/suds')
const globalTags = require('../../local/global-header-tags')
import { Response, ViewData } from '../types.js'

module.exports = async function (res: Response , view: string, output: string | ViewData) {
  trace.log('sending output', typeof output)
  trace.log({ output, level: 'verbose' })
  let viewData: ViewData = { output: '' }
  if (output) {
    if (typeof output === 'string') {
      viewData.output = output
      viewData.footnote = ''
      viewData.headerTags = suds.headerTags + globalTags
      viewData.pageHeaderTags = suds.pageHeaderTags + globalTags
      viewData.heading = ''
    } else {
      viewData = output
      let headerTags = suds.headerTags
      if (output.headerTags) { headerTags += output.headerTags }
      viewData.headerTags = headerTags + globalTags
      viewData.pageHeaderTags = suds.pageHeaderTags + globalTags
    }
  }
  let dateStamp: string = new Date().toLocaleString()
  viewData.footnote += '&nbsp;' + dateStamp
  viewData.footnote = viewData.footnote.replace('{{version}}', suds.versionHistory[suds.versionHistory.length - 1].version)
  if (!viewData.headerTags) { viewData.headerTags = '<!-- space for program generated header tags -->' }
  if (!viewData.pageHeaderTags) { viewData.pageHeaderTags = '<!-- space for program generated header tags -->' }
  res.render(view, viewData)
  return ('OK')
}
