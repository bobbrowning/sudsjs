const { checkRequiredTime } = require("tarn/dist/utils")

dotenv=require('dotenv').config();

module.exports = {
  /* ****************************************************
  *
  *  Configure SUDS
  *
  ***************************************************** */

  title: 'SUDS test database',

  description: `This is a sample test database to illustrate the main features of SUDS.
  It is not meant to be realistic, as a real system you have more complex data than we 
  have here. It is designed to illustrate the main features of the SUDS system.`,

  versionHistory: [
    { version: '1.0.0', date: '2021-08-20', author: 'Bob', description: 'Initial test database' },
  ],


  emailTransport: {
    service: 'gmail',
    auth: {
      user: 'sudsexpress21@gmail.com',
      pass: 'suds-2021&$'
    }

  },

  /*
    database:
    {
      client: 'mysql',
      connection: {
        host: 'localhost',
        user: 'bob',
        password: '*********',
        database: 'suds',
      },
    },
  */
  database: {
    client: 'sqlite3',
    connection: {
      filename: './suds.db',
    },
    useNullAsDefault: true,
  },


  tables: [
    'user',
    'audit',
    'webpages',
    'contacts',
    'products',
    'salesorders',
    'salesorderlines',
    'purchaseorders',
    'productjoin',
    'purchaseorderlines',
    'productsparesjoin',
    'spares',
  ],

  /* Normally SQL statements are like this SELECT FROM table WHREE col=xxx                */
  /* But if the column name is a reserved word this won't work. Set this to true          */
  /*  and the SQL will loook like this  SELECT FROM table WHREE table.col=xxx             */
  /* If this doesn't work for your DBM, it can be changed in /bin/suds/get-instruction.js */
  fixWhere: true,





  /**
   *  Presentation
   */

  pageLength: 10,                              //  Number of rows per page on a table list
  defaultInputFieldWidth: '480px',
  audit: {                                    // Audit trail file - logs every operation
    include: true,
    trim: [1000, 1200],                       // Audit trail trimmed to 1000 records. 
  },                                          // when it reaches 1200.  Comment out for no trim.
  currency: {
    currency: 'GBP',                          // British pounds
    locale: 'en-GB',
    digits: 2,
  },

  viewEngine: 'ejs',
  views: [
    'admin',  /* REQUIRED */
    'pages',
  ],


  /**
   * 
   * Content Management
   * 
   */

  homePage: 'index',     /* slug of the home page */
   pageFile: {
    table: 'webpages',
    /* Columns in the page File */
    id: 'pageno',
    title: 'title',
    status:'status',
    embargo:'embargo',
    expires:'expires',
    slug:'slug',
  
   },

  /* ****************************************************
  *
  * The default format for fields in the input form. This can be over-ridden for 
  * individual fields. For example see config>suds-website.js in the test data   
  * the 'content' field is in column format (input field under the title) 
  *
  ***************************************************** */

  input: {
    default: 'row',
    class: 'form-control',
  },

  /* 
  *
  *  Search / filter rules.
  *
   */

  search: {
    fieldWidth: '250px',                       // Size of search text fields
    maxConditions: '7',                        // This number can be increased if you need more conditiona
    /* These are always equals search types. Less than & greater than have no meaning */
    allwaysEquals: ['radio', 'select', 'yesnoRadio', 'checkbox'],
    /* These input types always have a simple input text field in the search      */
    /* whatever the input type on forms                                           */
    allwaysText: ['text', 'autocomplete', 'textarea', 'summernote','unique'],
  },


  /* 
  *
  *  Input field types 
  * There are the input.type values that are passed on to the 
  * generic input routine.  Any other input types must be 
  * created by a handler called suds-input-fieldtype.js 
  * The report will list the handlers currently installed.
  *
  */
  inputFieldTypes: [
    'text',
    'date',
    'password',
    'color',
    'datetime-local',
    'email',
    'month',
    'tel',
    'time',
    'url',
    'week',
    'hidden',
    'number',
    'country',
  ],
  /** 
   * These are onput types that are handles by modules in
   * bin/suds/input. 
   */
  inputTypes: [
    'autocomplete',
    'checkbox',
    'radio',
    'readonly',
    'select',
    'summernote',
    'textarea',
    'upload-file',
    'yesno-radio',
  ],




  /* ****************************************************
  *
  *  Security
  *
  ***************************************************** */
  superuser: 'admin@admin.com',                //  This person is always superuser.

  forgottenPasswordExpire: 20,

  permissionSets: {
    /*   all: 'Built-in permission meaning everyone',  */
    /*  none: 'Buit-in permission meaning no-one',  */
    admin: 'General Manager.',
    support: 'Customer support',
    sales: 'Sales department',
    purchasing: 'Purchasing department',
    web: 'Web developers',
  },


  /** **********************************************
   * 
   *           Routes
   *           ------
   *********************************************** */

  /**
   * 
   * Functions -> route
   * 
   */
  mainPage: '/admin',                          // e.g. http://localhost:1337/admin
  baseURL: 'http://zorin2:3000',
  validate: {
    description: `Validate the configuration files`,
    page: '/validate-config',             // validate this config file plus sudstables
    permission: ['admin'],
  },

  report: {
    page: '/config-report',                 //  Database report
    permission: ['admin'],
  },

  /** 
   * 
   * routes -> module
   * 
   */
  get: {
    login: '../bin/suds/login',
    admin: '../bin/suds/admin',
    changepw: '../bin/suds/change-password',
    resetpw: '../bin/suds/reset-password',
    auto: '../bin/suds/api/autocomplete',
    unique: '../bin/suds/api/unique',
    validateConfig: '../bin/suds/validateconfig',
    configReport: '../bin/suds/configreport',
    createTable: '../bin/suds/create-table',
    register: '../bin/suds/register',
    logout: '../bin/suds/logout',
    forgotten: '../bin/suds/forgotten',
  },
  post: {
    changepw: '../bin/suds/change-password-process',
    register: '../bin/suds/register-process',
    login: '../bin/suds/login-process',
    admin: '../bin/suds/admin',

  }

}


