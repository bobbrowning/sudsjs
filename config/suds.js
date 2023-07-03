"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    port: 3000,
    mainPage: '/admin',
    baseURL: 'http://www.sudsjs.com',
    start: { precompileTables: false },
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
        login: '../bin/suds/login',
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
        fix: '../bin/suds/fix',
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
    databases: ['couch', 'mongo', 'sqlite', 'mysql', /*'postgresql'*/],
    dbDriver: 'couch',
    /* To allow us to use the same schema for sql and nosql databases, _id is changed for id in the driver */
    sqlKludge: true,
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
       * CouchDB doesn't have files or collections as such, so we have set up a special field
       * which contains the name of the collection in each document.  We use 'collection'
       * but you may need to change this is collection is a real field name
       * in your database.        *
       *
    */
    couch: {
        pageFile: 'webpagesnosql',
        dbkey: 'string',
        friendlyName: 'CouchDB',
        homepage: 'home',
        authtable: 'nosql',
        standardHeader: 'couch',
        countable: false,
        views: true,
        collectionField: 'collection',
        connection: {
            database: 'sudsjs',
            host: 'localhost:5984',
            requestDefaults: {},
        },
    },
    /** **************** MongoDB configuration ***************
      *
      *  */
    mongo: {
        pageFile: 'webpagesnosql',
        dbkey: 'string',
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
        let session = require('express-session');
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
    superuser: 'admin@admin.demo',
    csrf: false,
    authorisation: {
        nosql: {
            table: 'user',
            /** Columns in authorisation table */
            primaryKey: '_id',
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
            primaryKey: 'id',
            passwordHash: 'password',
            salt: 'salt',
            permissionSet: 'permission',
            superuser: 'isSuperAdmin',
            emailAddress: 'emailAddress',
            forgottenPasswordToken: 'forgottenPasswordToken',
            forgottenPasswordExpire: 'forgottenPasswordExpire',
        }
    },
    forgottenPasswordExpire: 600,
    rememberPasswordExpire: 600,
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
    audit: {
        include: true,
        trim: [1000, 1200],
        log: ['method', 'query', 'body'],
        /** If omitted al operations are logged.  */
        operations: ['new', 'update', 'delete', 'login', 'changepw'], // can include 'list' and listrow'
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
        'autocomplete',
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
            helpText: `This field only accepts numbers`, // included in the tooltip for this tyle of field.
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
            height: 300,
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
            toolbar: {
                style: ['style'],
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
                'p',
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
    pageLength: 10,
    currency: {
        currency: 'GBP',
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
        'admin',
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
        fieldWidth: '250px',
        maxConditions: '7',
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
            pass: 'duwybmlwqfndzukh' // This has been revoked. 
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
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWcvc3Vkcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYjs7Ozs7OzZEQU15RDtJQUN6RCxLQUFLLEVBQUUsb0JBQW9CO0lBQzNCLFdBQVcsRUFBRTs7OztHQUlkO0lBQ0MsY0FBYyxFQUFFO1FBQ1osRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsdUJBQXVCLEVBQUU7UUFDN0YsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsNEJBQTRCLEVBQUU7UUFDbEcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFO1FBQ2xGLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLDRCQUE0QixFQUFFO1FBQ2xHLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLHlDQUF5QyxFQUFFO0tBQ2xIO0lBQ0Q7Ozs7Ozs7Ozt1REFTbUQ7SUFDbkQsSUFBSSxFQUFFLElBQUk7SUFDVixRQUFRLEVBQUUsUUFBUTtJQUNsQixPQUFPLEVBQUUsdUJBQXVCO0lBQ2hDLEtBQUssRUFBRSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRTtJQUNsQzs7Ozs7T0FLRztJQUNILEdBQUcsRUFBRTtRQUNELEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsY0FBYyxFQUFFLDRCQUE0QjtRQUM1QyxZQUFZLEVBQUUsMEJBQTBCO1FBQ3hDLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsUUFBUSxFQUFFLDZCQUE2QjtRQUN2QyxPQUFPLEVBQUUsNEJBQTRCO1FBQ3JDLElBQUksRUFBRSw4QkFBOEI7UUFDcEMsTUFBTSxFQUFFLHdCQUF3QjtRQUNoQyxNQUFNLEVBQUUsd0JBQXdCO1FBQ2hDLElBQUksRUFBRSxzQkFBc0I7UUFDNUIsWUFBWSxFQUFFLDBCQUEwQjtRQUN4QyxRQUFRLEVBQUUsc0JBQXNCO1FBQ2hDLE1BQU0sRUFBRSxvQkFBb0I7UUFDNUIsU0FBUyxFQUFFLHVCQUF1QjtRQUNsQyxJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLFFBQVEsRUFBRSxzQkFBc0I7UUFDaEMsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixPQUFPLEVBQUUscUJBQXFCO1FBQzlCLEdBQUcsRUFBRSxpQkFBaUI7UUFDdEIsY0FBYztRQUNkLFdBQVcsRUFBRSw0QkFBNEI7UUFDekMsY0FBYyxFQUFFLCtCQUErQjtRQUMvQyxlQUFlLEVBQUUsbUNBQW1DO0tBQ3ZEO0lBQ0Qsb0JBQW9CO0lBQ3BCLElBQUksRUFBRTtRQUNGLFFBQVEsRUFBRSxxQ0FBcUM7UUFDL0MsUUFBUSxFQUFFLDhCQUE4QjtRQUN4QyxLQUFLLEVBQUUsMkJBQTJCO1FBQ2xDLEtBQUssRUFBRSxtQkFBbUI7S0FDN0I7SUFDRCxvRUFBb0U7SUFDcEUsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHO0lBQzdELE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsR0FBRztJQUM1RSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxHQUFHO0lBQzFCLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEdBQUc7SUFDNUIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsR0FBRztJQUNoQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsV0FBVyxHQUFHO0lBQ2hDLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxZQUFZLEdBQUc7SUFDbEM7Ozs7Ozs7Ozs7dURBVW1EO0lBQ25ELFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQztJQUNsRSxRQUFRLEVBQUUsT0FBTztJQUVqQix5R0FBeUc7SUFDekcsU0FBUyxFQUFFLElBQUk7SUFDZjs7OztRQUlJO0lBQ0osTUFBTSxFQUFFO1FBQ0osUUFBUSxFQUFFLFVBQVU7UUFDcEIsS0FBSyxFQUFFLFFBQVE7UUFDZixZQUFZLEVBQUUsVUFBVTtRQUN4QixRQUFRLEVBQUUsVUFBVTtRQUNwQixjQUFjLEVBQUUsS0FBSztRQUNyQixTQUFTLEVBQUUsS0FBSztRQUNoQixTQUFTLEVBQUUsSUFBSTtRQUNmLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRTtZQUNSLFFBQVEsRUFBRSx3QkFBd0I7U0FDckM7S0FDSjtJQUNEOzs7Ozs7Ozs7TUFTRTtJQUNGLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxlQUFlO1FBQ3pCLEtBQUssRUFBRSxRQUFRO1FBQ2YsWUFBWSxFQUFFLFNBQVM7UUFDdkIsUUFBUSxFQUFFLE1BQU07UUFDaEIsU0FBUyxFQUFFLE9BQU87UUFDbEIsY0FBYyxFQUFFLE9BQU87UUFDdkIsU0FBUyxFQUFFLEtBQUs7UUFDaEIsS0FBSyxFQUFFLElBQUk7UUFDWCxlQUFlLEVBQUUsWUFBWTtRQUM3QixVQUFVLEVBQUU7WUFDUixRQUFRLEVBQUUsUUFBUTtZQUNsQixJQUFJLEVBQUUsZ0JBQWdCO1lBQ3RCLGVBQWUsRUFBRSxFQUFFO1NBQ3RCO0tBQ0o7SUFDRDs7V0FFTztJQUNQLEtBQUssRUFBRTtRQUNILFFBQVEsRUFBRSxlQUFlO1FBQ3pCLEtBQUssRUFBRSxRQUFRO1FBQ2YsWUFBWSxFQUFFLFVBQVU7UUFDeEIsUUFBUSxFQUFFLE1BQU07UUFDaEIsU0FBUyxFQUFFLE9BQU87UUFDbEIsV0FBVyxFQUFFLFVBQVU7UUFDdkIsY0FBYyxFQUFFLE9BQU87UUFDdkIsZUFBZSxFQUFFLElBQUk7UUFDckIsU0FBUyxFQUFFLElBQUk7UUFDZixVQUFVLEVBQUU7WUFDUixRQUFRLEVBQUUsTUFBTTtZQUNoQixJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLGlFQUFpRTtZQUNqRSxzQkFBc0I7U0FDekI7S0FDSjtJQUNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXVCRTtJQUNGLEtBQUssRUFBRTtRQUNILEtBQUssRUFBRSxRQUFRO1FBQ2YsUUFBUSxFQUFFLFVBQVU7UUFDcEIsS0FBSyxFQUFFLFFBQVE7UUFDZixZQUFZLEVBQUUsT0FBTztRQUNyQixRQUFRLEVBQUUsVUFBVTtRQUNwQixjQUFjLEVBQUUsS0FBSztRQUNyQixTQUFTLEVBQUUsS0FBSztRQUNoQixTQUFTLEVBQUUsSUFBSTtRQUNmLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLE1BQU0sRUFBRSxPQUFPO1FBQ2YsVUFBVSxFQUFFO1lBQ1IsSUFBSSxFQUFFLFdBQVc7WUFDakIsUUFBUSxFQUFFLE1BQU07U0FDbkI7S0FDSjtJQUNEOzs7Ozs7Ozs7TUFTRTtJQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFrQkk7SUFDSix1Q0FBdUM7SUFDdkMsTUFBTSxFQUFFO1FBQ0osTUFBTTtRQUNOLE9BQU87UUFDUCxVQUFVO1FBQ1YsZUFBZTtRQUNmLFVBQVU7UUFDVixVQUFVO1FBQ1YsYUFBYTtRQUNiLGFBQWE7UUFDYixnQkFBZ0I7UUFDaEIsYUFBYTtRQUNiLG9CQUFvQjtRQUNwQixZQUFZO1FBQ1osZ0JBQWdCO1FBQ2hCLDRCQUE0QjtRQUM1QixVQUFVO1FBQ1YsZ0JBQWdCO1FBQ2hCLFFBQVE7UUFDUixvQkFBb0I7UUFDcEIsZUFBZTtRQUNmLGtCQUFrQjtRQUNsQixXQUFXO1FBQ1gsU0FBUztRQUNULFlBQVk7S0FDZjtJQUNELFVBQVUsRUFBRTtJQUNaLDZEQUE2RDtLQUM1RDtJQUNELHVCQUF1QjtJQUN2QixlQUFlLEVBQUU7UUFDYixxQkFBcUIsRUFBRSx3QkFBd0I7UUFDL0MsS0FBSyxFQUFFLGNBQWM7S0FDeEI7SUFDRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsY0FBYyxFQUFFLEtBQUs7SUFDckI7Ozs7Ozs7Ozs7U0FVSztJQUNMLE9BQU8sRUFBRTtRQUNMLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sT0FBTyxDQUFDO1lBQ1gsTUFBTSxFQUFFLFdBQVc7WUFDbkIsTUFBTSxFQUFFLE9BQU87WUFDZixpQkFBaUIsRUFBRSxJQUFJO1NBQzFCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7Ozs7NERBS3dEO0lBQ3hELFNBQVMsRUFBRSxrQkFBa0I7SUFDN0IsSUFBSSxFQUFFLEtBQUs7SUFDWCxhQUFhLEVBQUU7UUFDWCxLQUFLLEVBQUU7WUFDSCxLQUFLLEVBQUUsTUFBTTtZQUNiLHFDQUFxQztZQUNyQyxVQUFVLEVBQUUsS0FBSztZQUNqQixZQUFZLEVBQUUsVUFBVTtZQUN4QixJQUFJLEVBQUUsTUFBTTtZQUNaLGFBQWEsRUFBRSxZQUFZO1lBQzNCLFNBQVMsRUFBRSxjQUFjO1lBQ3pCLFlBQVksRUFBRSxjQUFjO1lBQzVCLHNCQUFzQixFQUFFLHdCQUF3QjtZQUNoRCx1QkFBdUIsRUFBRSx5QkFBeUI7U0FDckQ7UUFDRCxHQUFHLEVBQUU7WUFDRCxLQUFLLEVBQUUsTUFBTTtZQUNiLHFDQUFxQztZQUNyQyxVQUFVLEVBQUUsSUFBSTtZQUNoQixZQUFZLEVBQUUsVUFBVTtZQUN4QixJQUFJLEVBQUUsTUFBTTtZQUNaLGFBQWEsRUFBRSxZQUFZO1lBQzNCLFNBQVMsRUFBRSxjQUFjO1lBQ3pCLFlBQVksRUFBRSxjQUFjO1lBQzVCLHNCQUFzQixFQUFFLHdCQUF3QjtZQUNoRCx1QkFBdUIsRUFBRSx5QkFBeUI7U0FDckQ7S0FDSjtJQUNELHVCQUF1QixFQUFFLEdBQUc7SUFDNUIsc0JBQXNCLEVBQUUsR0FBRztJQUMzQix3QkFBd0IsRUFBRTtRQUN0QixJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLE9BQU8sRUFBRSxnQkFBZ0I7UUFDekIsSUFBSSxFQUFFOzs7Ozs7c0RBTXdDO0tBQ2pEO0lBQ0QsY0FBYyxFQUFFO1FBQ1oscURBQXFEO1FBQ3JELGtEQUFrRDtRQUNsRCxLQUFLLEVBQUUsNEJBQTRCO1FBQ25DLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsVUFBVSxFQUFFLHVCQUF1QjtRQUNuQyxHQUFHLEVBQUUsZ0JBQWdCO1FBQ3JCLE9BQU8sRUFBRSxVQUFVO1FBQ25CLElBQUksRUFBRSxxQkFBcUI7UUFDM0IsS0FBSyxFQUFFLHNDQUFzQztRQUM3QyxLQUFLLEVBQUUsb0NBQW9DO1FBQzNDLEtBQUssRUFBRSxtQ0FBbUM7S0FDN0M7SUFDRCxLQUFLLEVBQUU7UUFDSCxPQUFPLEVBQUUsSUFBSTtRQUNiLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7UUFDbEIsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUM7UUFDaEMsNENBQTRDO1FBQzVDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRSxrQ0FBa0M7S0FDbkc7SUFDRDs7Ozs7Ozs7Ozs7TUFXRTtJQUNGLE1BQU0sRUFBRTtRQUNKLE1BQU0sRUFBRSxLQUFLO0tBQ2hCO0lBQ0Q7c0RBQ2tEO0lBQ2xELG9DQUFvQztJQUNwQyxtQ0FBbUM7SUFDbkM7Ozs7dURBSW1EO0lBQ25EOzs7Ozs7T0FNRztJQUNILGVBQWUsRUFBRTtRQUNiLE1BQU07UUFDTixNQUFNO1FBQ04sVUFBVTtRQUNWLE9BQU87UUFDUCxnQkFBZ0I7UUFDaEIsT0FBTztRQUNQLE9BQU87UUFDUCxLQUFLO1FBQ0wsTUFBTTtRQUNOLEtBQUs7UUFDTCxNQUFNO1FBQ04sUUFBUTtRQUNSLFFBQVE7S0FDWDtJQUNEOzs7Ozs7T0FNRztJQUNILGlCQUFpQixFQUFFO1FBQ2YsY0FBYztRQUNkLFVBQVU7UUFDVixZQUFZO1FBQ1osT0FBTztRQUNQLFVBQVU7UUFDVixRQUFRO1FBQ1IsWUFBWTtRQUNaLFdBQVc7UUFDWCxXQUFXO1FBQ1gsVUFBVTtRQUNWLFlBQVk7UUFDWixZQUFZO1FBQ1osa0JBQWtCO0tBQ3JCO0lBQ0Q7Ozs7Ozs7O01BUUU7SUFDRixLQUFLLEVBQUU7UUFDSCxPQUFPLEVBQUUsS0FBSztRQUNkLEtBQUssRUFBRSxjQUFjO0tBQ3hCO0lBQ0Qsc0JBQXNCLEVBQUUsT0FBTztJQUMvQiwrREFBK0Q7SUFDL0Qsa0JBQWtCLEVBQUUsS0FBSztJQUN6Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BMkJFO0lBQ0YsVUFBVSxFQUFFO1FBQ1IsTUFBTSxFQUFFO1lBQ0osUUFBUSxFQUFFLGlDQUFpQyxFQUFFLGtEQUFrRDtTQUNsRztRQUNEOzs7OzthQUtLO1FBQ0wsVUFBVSxFQUFFO1lBQ1IsVUFBVSxFQUFFOzs7Ozs7OztTQVFmO1lBQ0csUUFBUSxFQUFFOzs7Ozs7Ozs7WUFTVjtZQUNBLE1BQU0sRUFBRSxHQUFHO1lBQ1gsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxDQUFDO1lBQ25FLFNBQVMsRUFBRTtnQkFDUCxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7Z0JBQ3hELEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtnQkFDNUQsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO2dCQUM1RCxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7Z0JBQzVELEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDaEUsRUFBRSxLQUFLLEVBQUUsOEJBQThCLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7Z0JBQzFGLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO2FBQ25GO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDaEIsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztnQkFDcEQsUUFBUSxFQUFFLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztnQkFDbEMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUNoQixJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQztnQkFDL0IsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUNoQixNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQztnQkFDcEMsSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUM7YUFDM0M7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsS0FBSyxFQUFFO29CQUNILENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3RFLENBQUMsT0FBTyxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLENBQUMsQ0FBQztvQkFDbkQsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztpQkFDOUI7Z0JBQ0QsSUFBSSxFQUFFO29CQUNGLENBQUMsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3pDO2dCQUNELEtBQUssRUFBRTtvQkFDSCxDQUFDLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUNoRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7aUJBQ3hEO2dCQUNELEdBQUcsRUFBRTtvQkFDRCxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwQixDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3hDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO29CQUM3QixDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwQixDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDbEM7YUFDSjtZQUNEOzs7O3FDQUl5QjtTQUM1QjtRQUNEOzs7Ozs7Ozs7Ozs7OztXQWNHO1FBQ0gsU0FBUyxFQUFFO1lBQ1Asb0VBQW9FO1lBQ3BFLFVBQVUsRUFBRTs7Ozs7T0FLakI7WUFDSywwRkFBMEY7WUFDMUYsbURBQW1EO1lBQ25ELGlEQUFpRDtZQUNqRCxxRkFBcUY7WUFDckYsTUFBTSxFQUFFO2dCQUNKO29CQUNJLElBQUksRUFBRSxRQUFRO29CQUNkLE9BQU8sRUFBRSxHQUFHO29CQUNaLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7aUJBQ2xDO2dCQUNEO29CQUNJLElBQUksRUFBRSxtQkFBbUI7b0JBQ3pCLE9BQU8sRUFBRSxLQUFLO29CQUNkLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUU7aUJBQ3JDO2FBQ0o7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsR0FBRztnQkFDSCxJQUFJO2dCQUNKLElBQUk7Z0JBQ0osSUFBSTtnQkFDSiw4QkFBOEI7Z0JBQzlCO29CQUNJLElBQUksRUFBRSxVQUFVO29CQUNoQixPQUFPLEVBQUUsS0FBSztvQkFDZCxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFO2lCQUN6QzthQUNKO1NBQ0o7UUFDRDs7Ozs7O09BTUQ7UUFDQyxTQUFTLEVBQUU7WUFDUCxVQUFVLEVBQUU7MEZBQ2tFO1NBQ2pGO0tBQ0o7SUFDRDs7Ozs7Ozt1REFPbUQ7SUFDbkQsVUFBVSxFQUFFLEVBQUU7SUFDZCxRQUFRLEVBQUU7UUFDTixRQUFRLEVBQUUsS0FBSztRQUNmLE1BQU0sRUFBRSxPQUFPO1FBQ2YsTUFBTSxFQUFFLENBQUM7S0FDWjtJQUNEOzs7Ozs7O09BT0c7SUFDSCxVQUFVLEVBQUUsS0FBSztJQUNqQixLQUFLLEVBQUU7UUFDSCxPQUFPO1FBQ1AsT0FBTztLQUNWO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNILE1BQU0sRUFBRTtRQUNKLFVBQVUsRUFBRSxPQUFPO1FBQ25CLGFBQWEsRUFBRSxHQUFHO1FBQ2xCLG9GQUFvRjtRQUNwRixhQUFhLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDO1FBQzVFLGdGQUFnRjtRQUNoRixnRkFBZ0Y7UUFDaEYsV0FBVyxFQUFFO1lBQ1QsTUFBTTtZQUNOLHVCQUF1QjtZQUN2QixVQUFVO1lBQ1YsWUFBWTtZQUNaLFdBQVc7WUFDWCxXQUFXO1lBQ1gsUUFBUTtZQUNSLFlBQVk7U0FDZjtLQUNKO0lBQ0Q7Ozs7dURBSW1EO0lBQ25ELGNBQWMsRUFBRTtRQUNaLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLElBQUksRUFBRTtZQUNGLElBQUksRUFBRSx5QkFBeUI7WUFDL0IsSUFBSSxFQUFFLGtCQUFrQixDQUFDLDBCQUEwQjtTQUN0RDtLQUNKO0lBQ0Q7Ozs7OztPQU1HO0lBQ0gsYUFBYSxFQUFFLGVBQWU7SUFDOUI7Ozs7O09BS0c7SUFDSCxVQUFVLEVBQUU7Ozs7Ozs7Ozs7Ozs7OztHQWViO0NBQ0YsQ0FBQyJ9