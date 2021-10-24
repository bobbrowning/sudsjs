
# Overview / installation

Suds Express is a database management system based on node,js. No or minimal coding is required to create an in-house CRUD application (Create, Read, Update, Delete). 
This will:
* give you a significant head-start for your project;
* reduce overall development time;
* provide a test-bed for your planned data structure before you commit resources;
* provide a system for users to enter data while you are developing the application.

It provides:

* An administration page.
* List / search / sort tables 
* List / Edit / Detete rows. 
* An extended permission system 

SUDS Express is new and is in beta testing.  The software plus test data only takes a few minutes to set up on your Linux system. 


# Setup of the SUDS system plus test data.


## Quick setup of the system plus test database



Download the zip file from https://github.com/bobbrowning/suds-express-demo (the green button 'Code' - last option) and place it in the root directory for your  applications. 

Unzip the file and run the bash installation script as follows.  When it asks for an app name provide a suitable name (say myapp).  This will be the directory name in which the app resides, so make sure it is suitable for this.

```
unzip suds-express-demo-main.zip
bash suds-express-demo-main/sudscopytest.sh
cd myapp
sails lift
```

Then in a browser:  http://localhost:3000/admin  

You will be asked to log in. The superuser is admin@admin.com password admin (not recommended for production use!)

Alternative logins are 
* web@web.com password: web, permission set: web;
* sales@sales.com password: sales, pemission set: sales; 
* purchasing@purchasing.com password: purchasing, permission set: purchasing;
* willy@sales.com password: willy, permission set: sales;
* howard@wagner.com password howard, permission set admin.

## Get started


1. Edit the config/suds.js file and change the superuser email address to your email address.
1. Run http://localhost:3000/admin and register with this email address
1. Run http://localhost:3000/admin again and log in with the new email address you should see a setup menu
1. Edit the user table, find your new record and set up the Uset type to 'in-house' and person/business to person.

The test system uses the same table for logged-in users (in-house), external customers, suppliers or companies. There is a user type that shows which is which.  There is also a radio button to identify people or organisations.  If you want to add new password-protected users, register them first via the starter app, then go in and add this information to their record. 

Don't forget to validate the config files whenever you edit them. It doesn't pick up all errors, but the most common ones (at least the ones I make).





