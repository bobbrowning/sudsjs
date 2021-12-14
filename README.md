
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


## Quick setup of the system plus test database.



Download the zip file from https://github.com/bobbrowning/sudsjs (the green button 'Code' - last option) and place it in the root directory for your  applications.  Alternatively use curl:
```
curl -L -o master.zip https://github.com/bobbrowning/sudsjs/archive/refs/heads/main.zip
```

Unzip the file and run the bash installation script as follows.  When it asks for an app name provide a suitable name (say myapp).  This will be the directory name in which the app resides, so make sure it is suitable for this.

```
bash sudsjs-main/install.sh
```

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

ou will be asked to log in. The demonstration user with wide powers is demo@demo.demo password demo (not recommended for production use!)

Alternative logins are 
* gladys@loman.demo password: gladys, permission: purchasing;
* howard@wagner.com password howard, permission: General manager
* willy@loman.com password willy, permission: sales


## Get started


1. Edit the config/suds.js file and change the superuser email address to your email address.
1. Run http://localhost:3000/admin and register with this email address
1. Run http://localhost:3000/admin again and log in with the new email address you should see a setup menu
1. Edit the user table, find your new record and set up the Uset type to 'in-house' and person/business to person.

The test system uses the same table for logged-in users (in-house), external customers, suppliers or companies. There is a user type that shows which is which.  There is also a radio button to identify people or organisations and a permissions selection list.  If you want to add new password-protected users, register them first via admin page, then go in and add this information to their record. 

Don't forget to validate the config files whenever you edit them. It doesn't pick up all errors, but the most common ones (at least the ones I make).  This is in the Setup section of the admin page.

The test system is set up to use port 3000, which is obviously not a final setup.  To change it tempoarily set the PORT environment variable or change the default in suds.js (config directory). Google "apache proxypass nodejs"  for some tip on how to integrate with the apache server using mod-proxy.  Try Googling "nodejs load balancing" for heavier loads.
