
# Overview / installation

SUDSjs is a database management system based on node,js. No or minimal coding is required and provides:

* List / filter / sort tables, 
* List / Edit / Delete rows. 
* An extended permission system, 
* An administration page,
* Some starter applications. The test data includes a useable contact management system and web site content, management system. 
* This is all controlled by configuration files.

This will:
* give you a significant head-start for your project;
* reduce overall development time;
* provide a test-bed for your planned data structure before you commit resources;
* provide a system for users to enter data while you are developing the application.

For fuul details please visit http://sudsjs.com. 

SUDSjs is new and is in beta testing.  The software plus test data only takes a few minutes to set up on your Linux system. It has been tested with SQLite3, MySQL, and Postgesql.

# Setup of the SUDS system plus test data.


Download the zip file from https://github.com/bobbrowning/sudsjs (the green button 'Code' - last option) and place it in the root directory for your  applications.  Alternatively use curl:
```
curl -L -o master.zip https://github.com/bobbrowning/sudsjs/archive/refs/heads/main.zip
```

Unzip the file and run the bash installation script as follows.  When it asks for an app name provide a suitable name (say myapp).  This will be the directory name in which the app resides.

```
bash sudsjs-main/install.sh
```

# Run the system as-is

To start the application: 
```
cd myapp
node bin/www
```
To stop the application just ^C.

Then in a browser:  http://localhost:3000  

This will load a website that is managed by SUDSjs and runs on a test SQLite database. It has links to various functions. To go straight to the administration area:  http://localhost:3000/admin.  

You will be asked to log in. The demonstration user with wide powers is demo@demo.demo password demo.

Alternative logins are 
* gladys@loman.demo password: gladys, permission: purchasing;
* howard@wagner.com password howard, permission: General manager
* willy@loman.com password willy, permission: sales

Alternatively start the application with 
```
cd myapp
nodemon -e js,css, ejs
```
Nodemon needs installing but will restart the app every time you change a config file, whuch is a big time-saver during development. 



# Set up your database

## Modify the configuration files 

The configuration files are in the config directory. The main file to change is suds.js.  This covers:
* Routes
* Security
* Data Input
* Views / Output
* Database
* Other technical configuration

1. Routes. Defines the mapping of URL to Javascript modules. It alsi includes the default port which the programs listen to. To change it temporarily set the PORT environment variable.
1. Set up the superuser email address in the security section. This section  defines the columns in the table used for authorised users. It also lists the permission sets you require.
1. The input section includes a list of input field types. Youy can create your own handlers for special input types, in which cas you list them here.
1. The view configuration lists the view engine and views. This is set to ejs. Other view engines have not been tested.


## Set up the database. 
1. Update/create the table definitions
* There must be a user table defined and it must have certain fields in it. You will find these in the authorisation section of suds.js. (If you change this you will currently be in uncharted territory but you can add/remove other fields.) 
* If you select an audit file it has to be configured like the one in the test database. 
1. Set up the database name and password in the suds.js config file along with the database type.  The test data config file has a mysql setup (without the password) commented out as an example.  
1. Add the tables to the database with http://localhost:3000/createtables.  This program is not password-protected so you might want to comment out the route in the config file after you have used it. This program does the heavy lifting in setting up tables, but does not update tables once they have been set up. The program can be used if you add new tables.


I have tested the software with sqlite3, mysql and postgresql. It's probably all right with other database management systems (DBMS), but if you run into problems, the code is all in bin/suds/db.js.  The most likely issue is in the code to find the key of a newly inserted row. All three DBMS behave differently. There is a fall-back method which is the read the most recently added row back. But in a high traffic multi-user environment this may cause problems.


# Run the system 
1. Run the admin page. 
1. Register with the same email address you set up as superuser in the config file.  Log in and you should see all of the home page sections. 
1. Click on 'All users' and edit the user you have just set up. You will need to set the User Type (presumably in-house) and Person or business. 
1. Don't forget to validate the config files whenever you edit them. It doesn't pick up all errors, but the most common ones (at least the ones I make).  This is in the Setup section of the admin page.









