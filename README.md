
# Overview / installation

## For full details please visit http://sudsjs.com.

This is a database support system I have developed. No coding is required to allow users to Create, Read, Update and Delete information.  SUDSjs gives you a quick start to creating your database and giving your back office an administration function. They can get to work on building the database while you develop the fancy customer-facing application. 

I am a retired software engineer, and this was my project in COVID lockdown to keep my brain active and keep me up to date with modern developments.  I just turned 80 so don't bank on me for long-term support, but I have no plans to check out any time soon. I hope this is useful to maybe give you ideas, or to use in NOSQL familiarisation or just steal the code. If anyone wants to work on this with a view to taking it on and getting it in production and long-term support, please contact me - bob@sudsjs.com.

You can see it in action at [sudsjs.com](http://sudsjs.com).  

# Functions:

* List / filter / sort tables, 
* List / Edit / Delete rows. 
* An extended permission system, 
* An administration page,
* Some starter applications. The test data includes a useable contact management system and website content management system. 
* This is all controlled by configuration files.
* Works with Mysql, PostgreSQL, SQLite 3, MongoDB, CouchDB

The NOSQL database support adds
* Denormalized data.
* Arbitrarily structured documents - Dictionary items and arrays.
* Variations in the fieldset within collections.

The CouchBD system does not support collections, so the system adds an extra field to each document to simulate this function.

SUDSjs is new and is in beta testing.  The software plus test data only takes a few minutes to set up on your Linux system. 
 

# Setup 

You need to have node.js set up. https://nodejs.org/en/

Download the SUDSJS zip file from https://github.com/bobbrowning/sudsjs, unzip it...
```
curl -L -o master.zip https://github.com/bobbrowning/sudsjs/archive/refs/heads/main.zip
unzip master.zip
mv sudsjs-main appName
cd ./appName
npm install
```
## Quick test

* The download includes an SQlite 3 test database in the new directory. The filename is suds.db
* Edit config/suds.js 
* Change the location of the sqlite database to your new application directory (near line 130). 
* Start sudsjs
```
./bin/www
```
If that doesdn't work, try
```
node ./bin/www
```

* In your browser http://localhost:3000
* Administration page http://localhost:3000/admin  login demo@demo.demo password demo.
* CTRL-C to stop the software.

MongoDB tedt data is also included. 

* Set up MongoDB Community edition.  https://www.mongodb.com/docs/manual/administration/install-community/
* Restore the data
```
mongorestore
```
* Edit config/suds.js.  
* Find dbDriver: 'sqlite' and change to mongo.  
* Start sudsjs again  Use the same login and password.


Alternative logins on both databases are 
* gladys@loman.demo password: demo, permission: Purchasing;
* howard@wagner.demo password demo, permission: General manager
* willy@loman.demo password demo, permission: Sales
* trainer@demo.demo password demo, permission: Training (MongoDB test set only)

To set up back office users click on Register. This is the only way to give password access to a user. Then edit the user to set the permission in the security section. Note that you only have access to the security section if you are superuser or have admin permission.

The superuser password in the test data is my secret as this is the same database as on the demo site. To set up your own superuser, 
1. Register a new user (click on Register in the Guest user page)
1. Change the superuser email  address in the suds.js config file (see below) to the email address of the new user
1. Now you can create other users using this login.

# Stop and start the application: 

To stop the application just ^C.

To start the application
```
cd myapp
./bin/www
```
During development, you can start the application with Nodemon.
```
cd myapp
nodemon -e js,css, ejs
```
Nodemon needs installing (https://www.npmjs.com/package/nodemon) but will restart the app every time you change a config file, whuch is a big time-saver during development. 


# Set up the configuration files

## Main configuration file 

The configuration files are in the config directory. The main file to change is suds.js.  This covers:
* Routes
* Security
* Data Input
* Views / Output
* Database
* Other technical configuration

1. Routes. Defines the mapping of URL to Javascript modules. It alsi includes the default port which the programs listen to. To change it temporarily set the PORT environment variable.
1. Set up the superuser email address in the security section. It also lists the permission sets you require.
1. The input section includes a list of input field types. You can create your own handlers for special input types (/bin/suds/input for examples), in which case you add them here.
1. The view configuration lists the view engine and views. The view engine is set to ejs (https://ejs.co/). Other view engines have not been tested.
1. Edit database type and authorisation data (below). There are sample sections for ditfferent  databases.

## Database

Find dbDriver: 'sqlite' in suds,js and change to your database of choice (mongo, couch, sqlite, postgresql or mysql).  These codes should match database configurations following this line.  The configurations that are there are relevent to the test data and will need editing.

The minimum schema requirement is for a user file to hold administration logins.  The essential fields in the user file are listed in config/suds.js with field names. I have not tested the system with other fieldnames, but they should be changeable in this config file.

Schemas are needed for all the files but I suggest you start with one or two files first.

Passwords are in local/auth.js

## Standard record header

You may need to modify config/standard-header.js.  
* There are differemt standard headers for different databases. You should only need one.
* For SQL databases the normal key field is 'id'.  For NOSQL it is '_id'.  
* The _rev and xcollection fields are for CouchDB only. 

## Audt trail
If auditing is selected in the config file (around line 410), the audit schems in the test data needs to be included. Note that the audit schema references the standard header. If your standard header deviates significantly from the standard header in the test data, you may need to transfer the fields into the audit schema and change standardHeader to false.

## Database schema files

The tables directory contains the test data schema.   You will need to retain the user schema and audit schema for the system to work.  You define the necessary fields in the user table in config/suds.js

1. Update/create the table definitions.  There must be a user table defined and it must have certain fields in it. You will find these in the security section of suds.js. (If you change this you will be in uncharted territory but you can add/remove other fields in this table.) 
If you have an audit file it has to have the same name and table definition as the one in the test database. 

1. For relational databases, add the tables to the database with http://localhost:3000/createtables. You don't need this for MongoDB or CouchDB.  This program is not password-protected so you might want to comment out the route in the config file after you have used it. This program does the heavy lifting in setting up tables, but does not update tables once they have been set up. The program can be used if you add new tables.

I have tested the software with sqlite3, mysql and postgresql relational systems. It's probably all right with other SQL database management systems (DBMS), but if you run into problems, the code is all in bin/suds/dbdrivers.js.  The most likely issue is in the code to find the key of a newly inserted row. All three DBMS behave differently. There is a fall-back method which is the read the most recently added row back. But in a high traffic multi-user environment this will be unreliable.

I started a Firestore database driver but it didn't go well (https://bob742.blogspot.com/2022/10/firestore-didnt-go-well-for-me.html) but the driver is there if you want to give it a shot. I never got round to working on the delete function.

I started on Cassandra but the documentation defeated me.  I may pick that up in the future.

## Home page layout

The admin page is specified in config/home.js.  There are two home pages in the test data, one for SQL and another the NOSQL but you only need one. Tne admin page config file references reports (predefined searches) in config/reports.js, but you can add those later.

# Final steps 

You need a superuser to get started. Use the system to register a new user. Then edit suds.js and look for superuser: change the email address to the one that you have just registered. 

To run the admin page:  http://localhost:3000/admin. You will need to register the admin user first with the superuser email which is set up in config/suds.js.  The port number can be changed in the config files or at runtime as an environment variable (PORT).  dot env should work,

Don't forget to validate the config files whenever you edit them. It doesn't pick up all errors, but the most common ones (at least the ones I make).  This is in the Setup section of the admin page.









