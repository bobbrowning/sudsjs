const trace = require('track-n-trace')
const sendView = require('./send-view')
const suds = require('../../config/suds')
const lang = require('../../config/language').EN
const Nano = require('nano')
const auth = require('../../local/auth')
let nano


module.exports = async function (req, res) {
  console.log(__dirname)
  const dbSpec = suds[suds.dbDriver]
  const authSpec = auth[suds.dbDriver]
  try {
    let authString = ''
    if (authSpec) { authString = `${authSpec.user}:${authSpec.password}@` }
    const url = `http://${authString}${dbSpec.connection.host}`
    trace.log(url)
    const opts = {
      url,
      requestDefaults: dbSpec.connection.requestDefaults
    }
    nano = Nano(opts)

    db = nano.db.use(dbSpec.connection.database)
    console.log(`Connected to ${suds.dbDriver} database (${dbSpec.friendlyName})`)
  } catch (err) {
    console.log('Database connected failed', trace.line('s'), err)
    process.exit()
  }
  let r = await db.list()
  trace.log(r.rows)
  trace.log(r.rows.length)
  let n = 0;
  for (let i = 0; i < r.rows.length; i++) {
    trace.log('getting',r.rows[i].id)
    row = await db.get(r.rows[i].id)
    trace.log(row)
   if (row.collection) {
      row.$collection = row.collection
      delete row.collection
    }
    trace.log(row)
   const result = await db.insert(row)
 
  }

  output = 'fixed'
  await sendView(res, 'admin', output)

}
