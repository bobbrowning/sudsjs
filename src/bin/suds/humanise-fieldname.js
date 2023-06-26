module.exports = function (fieldName) {
  const trace = require('track-n-trace')
  let chars = fieldName.replace(/_/g, ' ')
  chars = chars.split('')
  let humanisedName = chars[0].toUpperCase()
  for (let i = 1; i < chars.length; i++) {
    if (chars[i] == chars[i].toUpperCase()) {
      humanisedName += ' ' + chars[i].toLowerCase()
    } else {
      humanisedName += chars[i]
    }
  }
  trace.log(humanisedName, { level: 'verbose' })
  return (humanisedName)
}
