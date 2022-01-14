
/* ****************************************************
*
*  Configure SUDS
*
***************************************************** */

module.exports = {

  title: 'SUDS test database',

  description: `This is a sample test database to illustrate the main features of SUDS.
  It is not meant to be realistic, as a real system you have more complex data than we 
  have here. It is designed to illustrate the main features of the SUDS system.`,

  versionHistory: [
    { version: '1.0.0', date: '2021-08-20', author: 'Bob', description: 'Initial test database' },
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
    createtables: '../bin/suds/create-table',
    register: '../bin/suds/register',
    logout: '../bin/suds/logout',
    forgotten: '../bin/suds/forgotten',
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



  /* ****************************************************
  *
  *                    Security
  *                    --------
  *
  ***************************************************** */
  superuser: 'admin@admin.demo',                //  This person is always superuser.





  authorisation: {
    table: 'user',
    /** Columns in authorisation table */
    primaryKey: 'id',
    passwordHash: 'password',
    salt: 'salt',
    permissionSet: 'permission',
    superuser: 'isSuperAdmin',
    emailAddress: 'emailAddress',
    forgottenPasswordToken: 'forgottenPasswordToken',
    forgottenPasswordExpire: 'forgottenPasswordExpire',
  },


  forgottenPasswordExpire: 600,                //  Token sent in forgotten password email expires after this
  rememberPasswordExpire: 600,                   // cookie set by remember is this number of days to expire. 

  forgottenPasswordOptions: {
    from: 'info@sudsjs.com',
    subject: 'Password Reset',
    text: `A request was made for a new password for your account. 
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
    demo: 'Demonstration users',
  },


  audit: {                                    // Audit trail file - logs every operation
    include: true,
    trim: [1000, 1200],                       // Audit trail trimmed to 1000 records.
    log: ['ip', 'method', 'query', 'body'],      // items from the request to be listed. See https://expressjs.com/en/api.html#req. Stored as a JSON scring.
    /** If omitted al operations are logged.  */
    operations: ['new', 'update', 'populate', 'delete', 'login', 'changepw'],  // can include 'list' and listrow'
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
   * to the directory bin/suds/input anf add to this list.
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
   *           Database
   *           --------
   *********************************************** */

  /** *********   mysql config ***************************
   * commented out as we are using sqlite for the demo version... 
   * However I have done some testing with mysql and postgresql 
 /*
   database:
   {
     client: 'postgresql',
     connection: {
       host: 'localhost',
       user: 'postgres',
       password: 'xxxxxxxxx',
       database: 'suds',
     },
   },


      database:
      {
        client: 'mysql',
        connection: {
          host: 'localhost',
          user: 'bob',
          password: 'xxxxxxxxxx',
          database: 'suds',
        },
      },
*/
/*   **************  end of commented section ************ */

database: {
  client: 'sqlite3',
  connection: {
    filename: './suds.db',
  },
  useNullAsDefault: true,
},

/** List of tables in the database.. */
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
  'fieldtypes',
  'productvariant',
],

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

/** This puts quotes around the column name in where instructions.
 * You may need this if your column names include upper case because 
 * postgresql folds all column names to lower case unless quoted.
 * 
 */
quoteColName: true,

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
   return session ({
    secret: 'head shoe',
    resave: 'false',
   saveUninitialized: true,
});
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
  <script src="/javascripts/suds.js"></script>
   <!-- -------------------------------------------------------- -->
  `,


}


