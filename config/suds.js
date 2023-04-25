

module.exports = {

  /** ****************************************************
   *
   *  config/suds.js  
   * 
   *  Primaty SUDSjs configuration file
   *
   ***************************************************** */

  title: 'SUDS test database',

  description: `This is a sample test database to illustrate the main features of SUDS.
  It is not meant to be realistic, as a real system you have more complex data than we 
  have here. It is designed to illustrate the main features of the SUDS system.

  `,


  versionHistory: [
    { version: '1.0.0', date: '2021-08-20', author: 'Bob', description: 'Initial test database' },
    { version: '2.1.0', date: '2022-05-22', author: 'Bob', description: 'MongoDB compatible version' },
    { version: '2.1.1', date: '2022-09-01', author: 'Bob', description: 'Bugs fixed' },
    { version: '2.2.0', date: '2022-12-04', author: 'Bob', description: 'CouchDB compatible version' },
    { version: '2.3.0', date: '2023-01-24', author: 'Bob', description: 'Switch between databases via admin area' },
  ],

  /** **********************************************
   * 
   *           Routes
   *           ------
   * 
   * Note that the CMS route (/page/[slug]) is not handled with this
   * list. The route for this is handled in bin/routes.js so that
   * the slug can be forwared to the program.
   * 
   *********************************************** */


  port: 3000,                                  // Change temporarily by setting the PORT environment variable 
  mainPage: '/admin',                          // e.g. http://sudsjs.com/admin
  baseURL: 'http://www.sudsjs.com',
  start: {precompileTables: false

  }, 
  /**  
   * routes : module 
   * so for example, http://domain/admin runs the module in /bin/suds/admin.js
   * 
   *  GET requests 
   */
  get: {
    admin: '../bin/suds/admin',
    validateconfig: '../bin/suds/validateconfig',
    configreport: '../bin/suds/configreport',
    login: '../bin/suds/login',                      // e.g. http://localhost:3000/login results in bin/suds/login.js being run.
    changepw: '../bin/suds/change-password',
    resetpw: '../bin/suds/reset-password',
    auto: '../bin/suds/api/autocomplete',
    lookup: '../bin/suds/api/lookup',
    unique: '../bin/suds/api/unique',
    json: '../bin/suds/api/json',
    createtables: '../bin/suds/create-table',
    register: '../bin/suds/register',
    logout: '../bin/suds/logout',
    forgotten: '../bin/suds/forgotten',
    docs: '../bin/docs.js',
    switchdb: '../bin/suds/switchdb',
    dump: '../bin/suds/dump',
    restore: '../bin/suds/restore',
   // fix: '../bin/suds/fix',           // Changes all the collection names in couch...
 
    /** Custom  */
    getvariants: '../bin/custom/get-variants',
    getsubvariants: '../bin/custom/get-subvariants',
    apicustomrouter: '../bin/suds/api/api-custom-router',
  },



  /** POST requests */
  post: {
    changepw: '../bin/suds/change-password-process',
    register: '../bin/suds/register-process',
    login: '../bin/suds/login-process',
    admin: '../bin/suds/admin',

  },



  /** These map home page user functions (config/home.js) to routes */
  validate: { page: '/validateconfig', permission: ['admin'], },
  report: { page: '/configreport', permission: ['admin', 'demo', '#guest#'], },
  login: { page: '/login', },
  logout: { page: '/logout', },
  changepw: { page: '/changepw', },
  register: { page: '/register', },
  forgotten: { page: '/forgotten', },


  /** **********************************************
   * 
   *           Database
   *           --------
   * The database list matches the configuration objects balow.
   * The list specifies which databases you can switch inthe 
   * admin area. 
   * 
   * dbDriver is the database when the system is loaded.
   * 
   *********************************************** */

  databases: ['couch', 'couch1', 'mongo', 'sqlite', 'mysql', /*'postgresql'*/],
  dbDriver: 'couch',

  /** **************** SQLite3 configuration ***************
   * The database object set below  is used to initialise the knex library 
   * when the software is loaded. See knex documentation for details 
   * https://knexjs.org/#Installation-client
  * */

  sqlite: {
    pageFile: 'webpages',
    dbkey: 'number',
    friendlyName: 'SQLite 3',
    homepage: 'home-sql',
    standardHeader: 'sql',
    authtable: 'sql',
    countable: true,
    client: 'sqlite3',
    connection: {
      filename: '/home/bob/suds/suds.db',
    },
  },




  /** ******************* Couchdb configuration *********
     * 
     *     The authorisation codes are stored in local/auth.js
     * 
     * CoucgDB doesn't have files or collections as such, so we have set up a special field
     * which contains the n#me of the collection in each document.  We chose $collection
     * to ensure uniqueness.  You have to escape the $ with two back spashes.
     * (https://stackoverflow.com/questions/55976271/how-to-define-a-find-query-in-couchdb-mango-with-field-names-that-start-with-do)
     * 
     *
  */
  couch: {
    pageFile: 'webpagesnosql',
    dbkey: 'string',
    friendlyName: 'CouchDB',
    homepage: 'home',
    authtable: 'nosql',    // see authorisation section below
    standardHeader: 'couch',
    countable: false,
    views: true,
    collectionField: '\\$collection',  // Additional field in couch to indicate collection
    connection: {
      database: 'sudsjs',
      host: 'localhost:5984',
      requestDefaults: {},
    },

  },

  /** ******************* Couch 1 ******************** 
   * This is an exact copy of the mongoDB database. 
   * So it doesn't have any views set up.  It is for performance testing.
  */
  couch1: {
    pageFile: 'webpagesnosql',
    driverFile: 'couch',
    dbkey: 'string',
    friendlyName: 'Couch: Mongo copy',
    homepage: 'home',
    authtable: 'nosql',    // see authorisation section below
    standardHeader: 'couch',
    countable: false,
    connection: {
      host: 'localhost:5984',
      requestDefaults: {},
    },

  },


  /** **************** MongoDB configuration ***************
    * 
    *  */
  mongo: {
    pageFile: 'webpagesnosql',
    dbkey: 'string',       // The database key is actually an object, but the driver converts to string   
    friendlyName: 'Mongo DB',
    homepage: 'home',
    authtable: 'nosql',
    dbDriverKey: 'objectId',
    standardHeader: 'mongo',
    caseInsensitive: true,
    countable: true,
    connection: {
      database: 'suds',
      host: 'localhost:27017',
      //      maxpoolsize: 20,   // add query string parameters here...
      //      w: 'majority',
    },
  },





  /** *********   Postgresql config ***************************
   * Quotecolname puts quotes around the column name in where instructions.
   * You may need this if your column names include upper case because 
   * postgresql folds all column names to lower case unless quoted.
   * 
   *
  postgresql: {
    pageFile: 'webpages',
    dbkey: 'number',
    friendlyName: 'PostgreSQL',
    homepage: 'home-sql',
    standardHeader: 'sql',
    authtable: 'sql',
    countable: true,
    quoteColName: true,
    client: 'pg',
    connection: {
      host: 'localhost',
      database: 'suds',
    },
  },

  /** *********   mysql config ***************************
  */
  mysql: {
    dbkey: 'number',
    pageFile: 'webpages',
    dbkey: 'number',
    friendlyName: 'MySQL',
    homepage: 'home-sql',
    standardHeader: 'sql',
    authtable: 'sql',
    countable: true,
    qualifyColName: true,
    client: 'mysql',
    connection: {
      host: 'localhost',
      database: 'suds',
    },
  },



  /** ******************* Firebase configuration *********
   * 
   *
   dbDriver: 'db-firestore.js',
   dbkey: 'string',
   database: {
       keyFile: 'sudsjs-************.json',
       countable: false,
   },
  */


  /** ******************* Cassandra configuration *********
   * 
   *      ** under development ******
   * 
   *
  dbDriver: 'db-cassandra.js',
  dbkey: 'string',
  database: {
    clientData: {
      contactPoints: ['127.0.0.1:9042'],
      localDataCenter: 'datacenter1',
      keyspace: 'sudsjs',
    },
    countable: false,
    auth: {
      user: '***',
      password: '***',
    }
  },*/







  /** List of tables in the database.. */
  tables: [
    'user',
    'audit',
    'webpages',
    'webpagesnosql',
    'contacts',
    'products',
    'salesorders',
    'studentnorm',
    'purchaseorders',
    'productjoin',
    'purchaseorderlines',
    'fieldtypes',
    'productvariant',
    /* only for mongo version */
    'subjects',
    'subjectsdenorm',
    'papers',
    //   'papersdenorm',
    'studentdenorm',
    'studentsubschema',
    'subschema',
    'results',
    'examstaken',
  ],

  jsonSchema: [
//    'subjects'            //subjects.json is a json version
  ],

  /** Subschema Groups */
  subschemaGroups: {
    productSpecifications: 'Product specifications',
    exams: 'Exam results',
  },

  /** 
   * Normally SQL statements are like this "SELECT FROM table WHREE col=xxx"    
   * Set qualifyColName to true and the SQL will use qualified names, so it looks like this  
   *    SELECT FROM table WHERE table.col=xxx  
   * 
   * Theoretically this means you can use SQL reserved words as column names but I am 
   * not convinced this always works with sqlite. 
   * 
   * Qualified names  doesn't seem to work at all with postgresql so try quoting 
   * them below instead.
   * 
   * To avoid these issues, use lower case and avoid reserved words. 
   * 
   */

  qualifyColName: false,



  /** 
   * This provides session middleware. See https://www.npmjs.com/package/express-session
   * 
   * You will need to replace it depending on what database you are using    
   * see https://www.npmjs.com/package/express-session#compatible-session-stores
   * 
   * Warning: connect.session() MemoryStore used here is not designed 
   * for a production environment, as it will leak memory, and
   *  will not scale past a single process.
   * 
   * */
  session: function () {
    let session = require('express-session')
    return session({
      secret: 'head shoe',
      resave: 'false',
      saveUninitialized: true,
    });
  },



  /* ****************************************************
  *
  *                    Security
  *                    --------
  *
  ***************************************************** */
  superuser: 'admin@admin.demo',                //  This person is always superuser.

  csrf: false,

  authorisation: {
    nosql: {
      table: 'user',
      /** Columns in authorisation table */
      primaryKey: '_id',                             /* *********** change to _id for cassandra, id otherwise ******************* */
      passwordHash: 'password',
      salt: 'salt',
      permissionSet: 'permission',
      superuser: 'isSuperAdmin',
      emailAddress: 'emailAddress',
      forgottenPasswordToken: 'forgottenPasswordToken',
      forgottenPasswordExpire: 'forgottenPasswordExpire',
    },
    sql: {
      table: 'user',
      /** Columns in authorisation table */
      primaryKey: 'id',                             /* *********** change to _id for cassandra, id otherwise ******************* */
      passwordHash: 'password',
      salt: 'salt',
      permissionSet: 'permission',
      superuser: 'isSuperAdmin',
      emailAddress: 'emailAddress',
      forgottenPasswordToken: 'forgottenPasswordToken',
      forgottenPasswordExpire: 'forgottenPasswordExpire',
    }
  },


  forgottenPasswordExpire: 600,                //  Token sent in forgotten password email expires after this
  rememberPasswordExpire: 600,                   // cookie set by remember is this number of days to expire. 

  forgottenPasswordOptions: {
    from: 'info@sudsjs.com',
    subject: 'Password Reset',
    text: `A request was made
    
    
    for a new password for your account. 
    If this was not you please ignore this email. 
    To set up a new password, go to http://sudsjs.com/resetpw?user={{user}}.
    Enter this code {{token}} plus your new password.`,
  },


  permissionSets: {
    /*   all: 'Built-in permission meaning everyone',  */
    /*  none: 'Buit-in permission meaning no-one',  */
    admin: 'General Manager / support.',
    sales: 'Sales department',
    purchasing: 'Purchasing department',
    web: 'Web developers',
    trainer: 'Trainers',
    demo: 'Demonstration users',
    demor: 'Demonstration of relational database',
    demod: 'Demonstration of denormalised data',
    demov: 'Demonstration of variable content',
  },


  audit: {                                    // Audit trail file - logs every operation
    include: true,
    trim: [1000, 1200],                       // Audit trail trimmed to 1000 records.
    log: ['ip', 'method', 'query', 'body'],      // items from the request to be listed. See https://expressjs.com/en/api.html#req. Stored as a JSON scring.
    /** If omitted al operations are logged.  */
    operations: ['new', 'update', 'populate', 'delete', 'login', 'changepw'],  // can include 'list' and listrow'
  },


  /** This creates a log using the morgan middleware.  https://www.npmjs.com/package/morgan for details.
   *  This example will create a combined apache log in the base directory of the app (for those of a nostalgic disposition).  
   *  There are a number of different predefined formats.  
   *  The system currently does not support tokens or custom format functions. 
   *  Commented out on the demo system
     
    morgan: {
       format: 'common',
       file: 'apachelog.log',
    },
  
  */
  morgan: {
    format: 'dev',
  },


  /** You can block specific IPs or emails from using the system... A bit basic at present... 
   *   Blocked users are trwated as guest users.  */
  // blockIp: ['::ffff:192.168.0.56'],
  // blockEmail: ['admin@admin.com'],

  /** **********************************************
   * 
   *           Input
   *           ------
   *********************************************** */

  /**  
   *
   * These are the input field types that are passed on to the 
   * generic input routine. (bin/suds/input/generic.js)
   * You prpbably should not change this. 
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
  ],
  /** 
   * Any other input types must be covered by a handler 
   * in /bin/suds/input/ and listed below.  
   * 
   * To add new input types simply add a new source file
   * to the directory bin/suds/input and add to this list.
   */
  inputTypeHandlers: [
    'autocomplete',              //  e.g. an autocomplete input field ig generated by bin/suds/input/automomplete.js
    'checkbox',
    'checkboxes',
    'radio',
    'readonly',
    'select',
    'summernote',
    'ckeditor4',
    'ckeditor5',
    'textarea',
    'uploadFile',
    'yesnoRadio',
    'recordTypeSelect',
  ],
  /**
  * 
  * The default format for fields in the input form. This can be over-ridden for 
  * individual fields. For example see config>suds-website.js in the test data   
  * the 'content' field is in column format (input field under the title) 
  * 
  * This assuming the use of bootstrap.
  *
  */

  input: {
    default: 'row',
    class: 'form-control',
  },

  defaultInputFieldWidth: '480px',

  /** Only applies to  'required' validation on generic fields */
  useHTML5Validation: false,


  /**  
   * 
   *                      Input type configuration
   *                      ------------------------
   * 
   * You can use this section to add help text that is added to the column 
   * description in the tooltip you get by hovering over the field 
   * name.
   * 
   * However, mostly this is configuring the rich text editors that have
   * been tested. There are a number of these available but so far
   * these have been tested:
   * 
   *   * Summernote: A simple rich text editor. You can upload images
   *     and videos which are included in the html - not stored on the 
   *     server.
   *   * Ckeditor 4: A descendent of the venerable fckeditor. As such 
   *     it is very stable and functional. 
   *   * Ckeditor 5: A rewrite of the editor and the implementation here
   *     is very basic. To confure it properly you would need to download 
   *     it and configure your installation. You might want to fork the
   *     handler as well,
   * 
   * In all cases I have used and tested the cdn versions so I didn't need
   * to download the software. You might get better and more configurable
   * results from the downloaded version.  
   * 
  */

  inputTypes: {

    number: {
      helpText: `This field only accepts numbers`,     // included in the tooltip for this tyle of field.
    },
    /** 
     * 
     *                     Summernote configuration 
     *                     ------------------------
     * 
     * */
    summernote: {
      headerTags: `
      <!-- ----- include libraries(jQuery, bootstrap) needed for summernote ---- -->
       <link href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.js"></script>
       <!----------------------------------------------------------------------- -->
        `,
      helpText: `The rich text editor is called summernote.
More about this in https://www.summernote,org. There are
some things to be aware of:
1. normal style doesn't change the format of marked text. 
   it is only useful for new text. Other styles do.
2. This includes a faciity to upload images to include on the page.
    However you might find it better to upload images and copy
    the html from the link to the image.
3. You can increase the size of the box by dragging down the
bottom bar.`,
      height: 300,    // can be over-ridden in the input attributes.
      fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New'],
      styleTags: [
        { title: 'Normal', tag: 'p', className: '', value: 'p' },
        { title: 'Header 1', tag: 'h1', className: '', value: 'h1' },
        { title: 'Header 2', tag: 'h2', className: '', value: 'h2' },
        { title: 'Header 3', tag: 'h3', className: '', value: 'h3' },
        { title: 'Small', tag: 'p', className: 'smalltext', value: 'p' },
        { title: 'Block of text floating right', tag: 'div', className: 'rightdiv', value: 'div' },
        { title: 'Hover image 200px', tag: 'img', className: 'himage200', value: 'img' },

      ],

      toolbar: {                                   // this is optional. Omit for standard toolbar
        style: ['style'],                         // ful list of options https://summernote.org/deep-dive/
        font: ['bold', 'italic', 'underline', 'clear', 'hr'],
        fontname: ['fontname', 'fontsize'],
        color: ['color'],
        para: ['ul', 'ol', 'paragraph'],
        table: ['table'],
        insert: ['link', 'picture', 'video'],
        view: ['fullscreen', 'codeview', 'help'],
      },
      popover: {
        image: [
          ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
          ['float', ['floatLeft', 'floatRight', 'floatNone']],
          ['remove', ['removeMedia']]
        ],
        link: [
          ['link', ['linkDialogShow', 'unlink']]
        ],
        table: [
          ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
          ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
        ],
        air: [
          ['color', ['color']],
          ['font', ['bold', 'underline', 'clear']],
          ['para', ['ul', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture']]
        ]
      },
      /* There are other simple config options which are commented out
    blockquoteBreakingLevel: 1,
         Array options like this can also be added
    fontSizeUnits: ['px', 'pt'],    
       *******************   */
    },

    /**
     *                                 ckeditor 4 configuration 
     *                                 ------------------------
     * 
     *  **distribution**: can be as follows:
     *     basic - the Basic preset
     *     standard - the Standard preset
     *     standard-all - the Standard preset together with all other plugins created by CKSource*
     *     full - the Full preset
     *     full-all - the Full preset together with all other plugins created by CKSource*
     * 
     * The CDN version I am using does not come with the **editorplaceholder** plugin so this is 
     * commented out. It 'should' work if you use the downloaded editor and install the plugin. 
     *    
     */

    ckeditor4: {
      /** replace 'standard' by 'full' for the complete set of options. */
      headerTags: `
  <!-- ------------------ tags required for ckedit 4 --------------------- -->
  <script src="https://cdn.ckeditor.com/4.16.2/standard/ckeditor.js"></script>
  <link rel="stylesheet" href="/stylesheets/page.css">
  <!----------------------------------------------------------------------- -->
      `,
      /** This *should* work if the software is downloaded and editorplaceholder plugin added */
      //  editorplaceholder: 'Please enter page content',

      /** omit styles or formats to get the defaults */
      /** styles apply to marked text. Formats apply to the whole block the cursor is in */
      styles: [
        {
          name: 'Button',
          element: 'p',
          attributes: { class: 'button' }
        },
        {
          name: 'Hover image 200px',
          element: 'img',
          attributes: { class: 'himage200' }
        },
      ],

      formats: [
        'p',    // shortcut for {name: 'p', element: 'p'}
        'h1',
        'h2',
        'h3',
        /** example of custom style */
        {
          name: 'Divright',
          element: 'div',
          attributes: { style: 'float: right;' }
        },
      ],


    },
    /** 
 * 
 *                            Ckeditor 5
 *                            ----------
 *     This is a basic implementation
 * 
 */
    ckeditor5: {
      headerTags: `
    <script src="https://cdn.ckeditor.com/ckeditor5/30.0.0/classic/ckeditor.js"></script>`,
    },

  },




  /** **********************************************
   * 
   *           View configuration
   *           ------------------
   * 
   *   Configures output options and view engine.
   * 
   *********************************************** */

  pageLength: 10,                              //  Number of rows per page on a table list

  currency: {
    currency: 'GBP',                          // British pounds
    locale: 'en-GB',
    digits: 2,
  },

  /** The system is not tested with other view engines. But changing this
   * would call a different engine to be called.  See the following for a comp,ete list
   *  https://expressjs.com/en/resources/template-engines.html
   * 
   * 
   * List the views used below.
   * 
   */
  viewEngine: 'ejs',
  views: [
    'admin',  /* REQUIRED */
    'pages',
  ],

  /**   Search / filter rules.
   * 
   *   Normally the search uses the same input type as the input field.
   *   so if the input is a radio button the search request will also be 
   *   a radio  button. However some input types are not available 
   *   in search so a simple input field is used instead.
   * 
   */
  search: {
    fieldWidth: '250px',                       // Size of search text fields
    maxConditions: '7',                        // This number can be increased if you need more conditiona
    /* These are always equals search types. Less than & greater than have no meaning */
    allwaysEquals: ['radio', 'select', 'yesnoRadio', 'checkbox', 'autocomplete'],
    /* These input types always have a simple input text field in the search      */
    /* whatever the input type on forms                                           */
    allwaysText: [
      'text',
      //      'autocomplete',
      'textarea',
      'summernote',
      'ckeditor4',
      'ckeditor5',
      'unique',
      'uploadFile',
    ],
  },



  /** **********************************************
   * 
   *           Other technical config
   *           ----------------------
   *********************************************** */


  emailTransport: {
    service: 'gmail',
    auth: {
      user: 'sudsexpress21@gmail.com',
      pass: 'duwybmlwqfndzukh'          // This has been revoked. 
    }

  },



  /**
   * 
   * Documentation flag. If the first argument to many routines 
   * is this value then the function will return the friendly name and description
   * instead of its normal function.  You onlu need to change this if whatever 
   * this is set to is a credible first parameter.  
   */

  documentation: 'documentation',

  /**
   *  Header tags required for all input/list functions.  You could put this 
   * in the suds.ejs file instead, but it seemed safer to keep the 
   * technical stuff here.  
   * 
   */
  headerTags: `
  <!-- ------------------ Bootstrap CSS start ------------------- -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
    crossorigin="anonymous"></script>
  <!-- ------------------ Bootstrap CSS end ------------------- -->

  <!-- ------------------- suds styles and routines ------------ -->
  <link rel="stylesheet" href="/stylesheets/suds.css">
  <script src="/javascripts/require.js"></script>
  <script src="/javascripts/suds.js"></script>
  <script src="/javascripts/custom.js"></script>
   <!-- -------------------------------------------------------- -->
  `,


}


