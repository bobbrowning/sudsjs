
# Overview / installation

SUDSjs is a database management system based on node,js. No or minimal coding is required and provides:

* List / filter / sort tables, 
* List / Edit / Delete rows. 
* An extended permission system, 
* An administration page,
* Some basic functions to get you off the ground.  The test data includes a useable contact management system and web site content, management system. 
* This is all controlled by configuration files.

This will:
* give you a significant head-start for your project;
* reduce overall development time;
* provide a test-bed for your planned data structure before you commit resources;
* provide a system for users to enter data while you are developing the application.


SUDSjs is new and is in beta testing.  The software plus test data only takes a few minutes to set up on your Linux system. 


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

To stop the application just ^C.  To start it: 
```
cd myapp
node bin/www
```
Alternatively 
```
cd myapp
nodemon -e js,css, ejs
```
nodemon needs installing but will restart the app every time you change a config file, whuch is a big time-saver during development. 

Then in a browser:  http://localhost:3000  

This will load a website that is managed by SUDSjs and runs on a test SQLite database. It has links to various functions. To go straight to the administration area:  http://localhost:3000/admin.  

You will be asked to log in. The demonstration user with wide powers is demo@demo.demo password demo (not recommended for production use!)

Alternative logins are 
* gladys@loman.demo password: gladys, permission: purchasing;
* howard@wagner.com password howard, permission: General manager
* willy@loman.com password willy, permission: sales


# Developing your site

## 

## Set yourself up as superuser 
1. Edit the config/suds.js file and change the superuser email address to your email address.
1. Run the system and load the admin area in your browser. 
1. Register with your email address
1. Load the admin area again and log in with your email address you should see a setup menu as you are the superuser.
1. Edit the user table, find your record and set up the Uset type to 'in-house' and person/business to person.

The test system uses the same table for logged-in users (in-house), external customers, suppliers or companies. There is a user type that shows which is which.  There is also a radio button to identify people or organisations and a permissions selection list.  If you want to add new password-protected users, register them first via admin page, then go in and add this information to their record. 

Don't forget to validate the config files whenever you edit them. It doesn't pick up all errors, but the most common ones (at least the ones I make).  This is in the Setup section of the admin page.

The test system is set up to use port 3000, which is obviously not a final setup.  To change it tempoarily set the PORT environment variable or change the default in suds.js (config directory). Google "apache proxypass nodejs"  for some tip on how to integrate with the apache server using mod-proxy.  Try Googling "nodejs load balancing" for heavier loads.



# Set up a new database

S far the system has been tested with sqlite3 and mysql.

1. Modify the configuration files to match your requirements. I have tested the software with sqlite3, mysql and postgresql. It's probably all right with other database management systems (DBMS), but if you run into problems, the code is all in bin/suds/db.js.  The most likely issue is the code to find the key of a newly inserted row. All three DBMS behave differently. There is a fall-back method which is the read the most recently added row back. But in a high traffic multi-user environment this may cause problems. 
1. There must be a user table defined and it must have certain fields in it. You will find these in the authorisation section of suds.js. (If you change this you will currently be in uncharted territory but you can add/remove other fields.) If you select an audit file it has to be configured like the one in the test database. 
1.You will need to create the database first. You don't need to create the tables at this stage. 
1. Set up the database name and password in the suds.js config file along with the database type.  The test data config file has a mysql setup (without the password) commented out as an example.  
1. Add the tables to the database with http://localhost:3000/createtables then take the link to the admin page.  This program is not password-protected so you might want to comment out the route in the config file aftert you have used it. This program does not update tables, but can be used to add new ones.
1. Register with the same email address you set up as superuser in the config file.  Log in and you should see all of the home page sections. 
1. Click on 'All users' and edit the user you have just set up. You will need to set the User Type (presumably in-house) and Person or business. 




