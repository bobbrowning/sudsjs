/* ****************************************
*
*  Validate the config file
*
**************************************** */
const trace = require('track-n-trace')
const suds = require('../../config/suds')
const sudshome = require('../../config/home')
const sudsReports = require('../../config/reports')
const lang = require('../../config/language').EN
// let getRow = require('./get-row');
const db = require('./db')
const fs = require('fs')
const jsonFragments = require('../../tables/fragments')

const standardHeader = require('../../config/standard-header')[suds[suds.dbDriver].standardHeader]

module.exports = async function (req, res) {
  console.log(__dirname)
  trace.init(req, './')

  trace.log({ starting: 'Validate Config', break: '#' })

  let user = {}
  permission = '#guest#'

  if (req.cookies.user) {
    req.session.userId = req.cookies.user
  }

  if (req.session.userId) {
    user = await db.getRow('user', req.session.userId)
    if (user.isSuperAdmin) { permission = '#superuser#' } else { permission = user.permission }
    if (suds.superuser == user.emailAddress) { permission = '#superuser#' }
    trace.log({ 'User record': user, level: 'verbose' })
  }

  errors = ''
  warnings = ''
  errorCount = -0
  warningCount = 0
  /* ****************************************
    *
    *  Validate  suds.config
    *
    **************************************** */

  seterror = function (msg) {
    console.log(msg)
    msg = msg.replace(/\n/g, '<br />&nbsp;&nbsp;')
    this.errors += `\n<p>Error:<br />${msg}</p>`
    errorCount++
  }
  warning = function (msg) {
    console.log(msg)
    msg = msg.replace(/\n/g, '<br />&nbsp;&nbsp;')
    this.warnings += `\n<p>Warning:<br />${msg}</p>`
    warningCount++
  }

  const validSections = [
    'title',
    'description',
    'versionHistory',
    'database',
    'dbDriver',
    'tables',
    'port',
    'get',
    'post',
    'csrf',
    'useHTML5Validation',
    'subschemaGroups',
    'validate',
    'baseURL',
    'mainPage',
    'validatePage',
    'forgottenPasswordOptions',
    'session',
    'morgan',
    'authorisation',
    'login',
    'logout',
    'changepw',
    'register',
    'report',
    'forgotten',
    'pageLength',
    'superuser',
    'defaultInputFieldWidth',
    'forgottenPasswordExpire',
    'rememberPasswordExpire',
    'audit',
    'currency',
    'qualifyColName',
    'quoteColName',
    'input',
    'search',
    'permissionSets',
    'inputFieldTypes',
    'inputTypes',
    'inputTypeHandlers',
    'viewEngine',
    'views',
    'emailTransport',
    'documentation',
    'headerTags',
    'dbkey',
    'dbType',
    'dbDriverKey',
    'dbDriverName',
    'caseInsensitive',
    'databases'
  ]
  console.log('Checking suds.js: ')
  for (const key of Object.keys(suds)) {
    console.log('- checking : ', key)
    item = suds[key]
    if (!(validSections.includes(key) || suds.databases.includes(key))) {
      seterror(`In suds.js: 
        ${key} is not  valid item`)
    }
    if (key == 'pageLength' && !Number.isInteger(item)) {
      seterror(`In suds.js: 
        pageLength ${item} must be an integer`)
    }
    if (key == 'startSuperusers' && !Number.isInteger(item)) {
      seterror(`In suds.js: 
        startSuperusers ${item} must be an integer`)
    }
    if (key == 'defaultInputSize' && !Number.isInteger(item)) {
      seterror(`In suds.js: 
        defaultInputSize ${item} must be an integer`)
    }
  }

  /**
     *
     * Check home page setup
     *
     */

  const hometypes = [
    'table',
    'report',
    'www',
    'user'
  ]

  for (const section of Object.keys(sudshome)) {
    if (sudshome[section].links) {
      for (let i = 0; i < sudshome[section].links.length; i++) {
        const link = sudshome[section].links[i]
        let type = ''
        for (const key of Object.keys(link)) {
          if (hometypes.includes(key)) {
            type = key
          }
        }
        if (!type) {
          seterror(`In home.js: 
                Section ${section} 
                link  ${i + 1} does not have a type.`)
        }
      }
    }
  }

  /* ****************************************
    *
    *  Validate tables.config
    *
    **************************************** */
  const validProperties = [
    'ref',
    'type',
    'primaryKey',
    'autoincrement',
    'database',
    'process',
    'input',
    'titleField',
    'display',
    'associations',
    'search',
    'friendlyName',
    'description',
    'extendedDescription',
    'permission',
    'validations',
    'child',
    'collectionList',
    'canEdit',
    'canView',
    'model',
    'allowNull',
    'collection',
    'via',
    'example',
    'annotate',
    'values',
    'helpText',
    'recordTypeColumn',
    'addRow',
    'recordType',
    'array',
    'object',
    'stringify',
    'key',
    'qualifiedName',
    'qualifiedFriendlyName'

  ]
  const validTableData = [
    'rowTitle',
    'stringify',
    'standardHeader',
    'friendlyName',
    'description',
    'extendedDescription',
    'permission',
    'addRow',
    'stringify',
    'list',
    'groups',
    'properties',
    'attributes',
    'parentData',
    'edit',
    'open',
    'recordTypeColumn',
    'recordTypeInput',
    'demoRow',
    'subschema'
  ]
  const validChildData = [
    'tab',
    'link', // column in child table that links to this  (yes - we could probablt work that out)
    'limit', // number of child records listed in the detail page
    'order', // The order in which the are listed
    'direction', // ASC or DESC
    'heading', // Heading to the listing
    'addRow',
    'open', // whether this listing is automatically open
    'list',
    'columns',
    'hideEdit',
    'hideDetails',
    'addChildTip',
    'derive',
    'sort'
  ]
  const validTypes = [
    'string',
    'number',
    'boolean',
    'object'
  ]
  const validPermissions = Object.keys(suds.permissionSets)
  validPermissions.push('all')
  validPermissions.push('#guest#')
  validPermissions.push('#superuser#')

  // Start with the list of field types in suds.js then add the helpers that produce fields.
  /* clone the input field types to start */

  const validInputFieldTypes = []
  for (let i = 0; i < suds.inputFieldTypes.length; i++) {
    validInputFieldTypes.push(suds.inputFieldTypes[i])
  }
  for (let i = 0; i < suds.inputTypeHandlers.length; i++) {
    validInputFieldTypes.push(suds.inputTypeHandlers[i])
  }

  console.log('Checking tables')

  /* ****************************************
      *
      *  Loop through tables
      *
      **************************************** */

  for (const table of suds.tables) {
    let summernotes = 0
    trace.log({ table, break: '#' })
    console.log('- checking ', table)
    const tableObject = require(`../../tables/${table}`)
    /* ****************************************
        *
        *  consolidate properties of this table
        *
        **************************************** */
   
    /* ****************************************
        *
        *  Check table items
        *
        **************************************** */
    for (const key of Object.keys(tableObject)) {
      if (!validTableData.includes(key)) {
        seterror(`table: ${table}
            ${key} is not  valid item`)
            console.log(tableObject[key])
      }
    }

    /* ****************************************
         *
         *  Check permissions
         *
         **************************************** */

    if (tableObject.permission) {
      for (const criterion of Object.keys(tableObject.permission)) {
        sets = tableObject.permission[criterion]
        trace.log({ criterion, sets })
        for (let i = 0; i < sets.length; i++) {
          if (!validPermissions.includes(sets[i])) {
            seterror(`
          Table: ${table}  
          Permission: ${sets[i]} is not  valid permission set
          `)
          }
        }
      }
    }

    /* ****************************************
          *
          *  Check search field exists
          *
          **************************************** */
    let properties = tableObject.properties
  trace.log('search')
    if (tableObject.search) {
      const search = tableObject.search
      for (const srch of Object.keys(search)) {
        if (!properties[srch]) {
          seterror(`In project ${project}: 
              Table: ${table}  
              Search: ${srch} 
              Sorry ${srch} is not a valid field
              `)
        }
      }
    }

    /* ****************************************
           *
           *  Check groups
           *
           **************************************** */
    trace.log('groups')

    if (tableObject.groups) {
      for (const group of Object.keys(tableObject.groups)) {
        const columns = tableObject.groups[group].columns
        if (columns) {
          if (!Array.isArray(columns)) {
            seterror(`In table: ${table}  
              Group: ${group} 
              Sorry columns ${columns} is not an array
              `)
          } else {
            for (const column of columns) {
              if (!properties[column]) {
                seterror(`In table: ${table}  
            Group: ${group} 
            Sorry ${column} is not a valid field
            `)
              }
            }
          }
        }
      }
    }

    trace.log('columns')

    /* ****************************************
         *
         *  Check columns on listings
         *
         **************************************** */
    if (tableObject.list && tableObject.list.columns) {
      const columns = tableObject.list.columns
      trace.log(table, columns)
      for (let i = 0; i < columns.length; i++) {
        if (!properties[columns[i]]) {
          seterror(`
      Table: ${table} 
      In columns for listing: ${columns[i]} is not a valid attribute
      `)
        }
      }
    }

    if (tableObject.recordTypeColumn) {
      const recordTypeColumn = tableObject.recordTypeColumn
      if (!tableObject.properties[recordTypeColumn]) {
        seterror(`
                Table: ${table} 
                Record type column ${recordTypeColumn} is not a valid attribute
                `)
      }
    }

    /* ****************************************
          *
          *  All the properties /  properties valid?
          *
          **************************************** */
    dereference (properties, tableObject)
    validateproperties(table, properties)

    
/**
 * 
 *   Dereference schema
 * 
 * @param {object} properties 
 * @param {object} tableData 
 * @param {object} parent 
 */
function dereference (properties, tableData) {
  trace.log(properties)
  for (const key of Object.keys(properties)) {
    trace.log({ key: key , properties: properties[key]})
    if (key === '$ref') {
      let ref = properties[key]
      if (ref.includes('{{dbDriver}}')) { ref = ref.replace('{{dbDriver}}', suds.dbDriver) }
      if (ref.includes('#/$defs/')) {
        ref = ref.replace('#/$defs/', '')
        if (!(tableData['$defs'])) { throw new Error(`merge-attributes.js::No $defs object for ${ref}`) }
        if (!(tableData['$defs'][ref])) { throw new Error(`merge-attributes.js::No $defs/${ref} object`) }
        for (const jr of Object.keys(tableData['$defs'][ref])) {
          trace.log(jr, tableData['$defs'][ref][jr])
          properties[jr] = tableData['$defs'][ref][jr]
        }

      } else {
        trace.log(`Replacing $ref with object in ${properties[key]} = ${ref}`)
        for (const jr of Object.keys(jsonFragments[ref])) {
          properties[jr] = jsonFragments[ref][jr]
        }
      }
      delete properties[key]

    } else {
      if (properties[key].type == 'object') {
        trace.log(properties[key].properties)
//        if (properties[key].object) dereference(properties[key].object, tableData)
        if (properties[key].properties) dereference(properties[key].properties, tableData)
      }
    }
  }
  trace.log(properties)
}

    function validateproperties (table, properties) {
      for (const attribute of Object.keys(properties)) {
        console.log('-- checking properties ', attribute)
         if (attribute === '$ref') {continue}
        if (typeof properties[attribute] !== 'object') {
          seterror(`
            Table: ${table}  
            ${attribute} is not a valid attribute
            `)
        }
        if (properties[attribute].type == 'object') {
          if (!properties[attribute].object) {
            seterror(`
                        Table: ${table}  
                        Column: ${attribute} 
                        Needs an object property with sub-fields defined
                        `)
          } else {
            console.log('descending one level')
            validateproperties(table, properties[attribute].object)
          }
        }

        trace.log('table', attribute, properties[attribute].type)

        if (properties[attribute].type && !validTypes.includes(properties[attribute].type)) {
          seterror(`
                Table: ${table}  
                Column: ${attribute} 
                ${properties[attribute].type} is not  valid type
                `)
        }

        for (const property of Object.keys(properties[attribute])) {
          if (!validProperties.includes(property)) {
            seterror(`
            Table: ${table}  
            Column: ${attribute} 
            ${property} is not  valid property
            `)
          }
        }

        /* ****************************************
                  *
                  *  Input field types valid?
                  *
                  **************************************** */
        if (properties[attribute].input && properties[attribute].input.type) {
          if (!validInputFieldTypes.includes(properties[attribute].input.type)) {
            seterror(`
                        Table: ${table}  
                        Column: ${attribute} 
                        ${properties[attribute].input.type} is not  valid input type
                        `)
          }

          /* ****************************************
                     *
                     *  Only one summernote field
                     *
                     **************************************** */

          if (properties[attribute].input.type == 'summernote') {
            summernotes++
            if (summernotes > 1) {
              seterror(`In project ${project}: 
              Table: ${key}  
              Column: ${attribute} 
              Sorry you can only have one summernotes field in a form. (${summernotes})
              `)
            }
          }
          /* ****************************************
                    *
                    *  file type doesn't work yet
                    *
                    **************************************** */

          if (properties[attribute].input.type == 'file') {
            seterror(`In project ${project}: 
              Table: ${table}  
              Column: ${attribute} 
              Sorry the file upload feature is not yet working.
              `)
          }
        }
        /* ****************************************
                  *
                  *  Check associations
                  *
                  **************************************** */
        if (properties[attribute].collectionList) {
          if (!tableObject.properties[attribute].collection) {
            trace.log(attribute, properties[attribute])
            seterror(`In project ${project}: 
              Table: ${table}
              Column: ${attribute}  
              This column has a collectionList  section, but does not 
              have a collection set in the model.
              `)
            return
          }
          for (key of Object.keys(properties[attribute].collectionList)) {
            if (!validChildData.includes(key)) {
              seterror(`
              Table: ${table}  
              Column: ${attribute} 
              ${key} is not  valid
              `)
            }
          }
          const columns = properties[attribute].collectionList.columns
          if (columns) {
            if (!Array.isArray(columns)) {
              seterror(`In project ${project}: 
                  Table: ${table}  
                  Column: ${attribute} 
                  Property: collectionlist                   
                  Sorry columns ${columns} is not an array 
                  `)
            }
          }
        }
      }
    }
  }

  /* ****************************************
    *
    *  Validare reports.config
    *
    **************************************** */

  const validCompare = ['contains', 'startswith', 'startWith', 'eq', 'lt', 'gt', 'le', 'ge', 'ne']

  for (report of Object.keys(sudsReports)) {
    const reportData = sudsReports[report]
    trace.log(reportData)
    if (!reportData.table) {
      seterror(`In report ${report}:            
          The table name is required.
          `)
    }
    const table = reportData.table
    trace.log({ report, table })

    if (reportData.sort) {
      if (reportData.sort[1] != 'ASC' && reportData.sort[1] != 'DESC') {
        seterror(`In report ${report}:            
            The sort direction ${reportData.sort[1]} must be 'ASC' or 'DESC'
            `)
      }
    }
    if (reportData.search) {
      if (reportData.search.andor && reportData.search.andor != 'and' && reportData.search.andor != 'or') {
        seterror(`In report ${report}:            
            The search and/or (${reportData.search.andor} must be 'and' or 'or' (lower case)
            `)
      }
      for (let i = 0; i < reportData.search.searches.length; i++) {
        searchItem = reportData.search.searches[i]
        trace.log(searchItem[1])
        if (!validCompare.includes(searchItem[1])) {
          seterror(`In report ${report}:            
              The search comparison "${searchItem[1]}" is not a valid comparison
              `)
        }
      }
    }
  }

  /* ****************************************
       *
       *  Exit
       *
       **************************************** */
  let output = '<h2>Checking the SUDSjs config files for obvious errors</h2>'

  if (errorCount) {
    output += errors
  } else {
    output += '<p>No Errors</p>'
  }
  if (warningCount) {
    output += warnings
  } else {
    output += '<p>No warnings</p>'
  }
  output += `\n<p><a href="${suds.mainPage}">Admin page</a></p>`

  const summary = `${Date().slice(0, 21)}
    ${errorCount} Errors
    ${warningCount} Warnings
    `
  fs.writeFile('lastvalidate.txt', summary, err => {
    if (err) {
      console.error(err)
      return
    }
    console.log(summary)
  })

  res.send(output)
}
