new # Sails Update Database System (SUDS) - Beta

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

The best place to start is probably the [Screen shots](https://github.com/bobbrowning/suds-for-sails/blob/main/More_information/screen-shots.pdf), but why not download it and take it out for a spin.  Please report any issues - thanks. 

# More information

* [A more detailed list of features](https://github.com/bobbrowning/suds-for-sails/blob/main/More_information/features.md)
* [Screen shots with some explanitory text](https://github.com/bobbrowning/suds-for-sails/blob/main/More_information/screen-shots.pdf)
* [Overview of the configuration files](https://github.com/bobbrowning/suds-for-sails/blob/main/More_information/configuration.pdf)
* [Database/configuration report for the test system](https://github.com/bobbrowning/suds-for-sails/blob/main/More_information/database-report.pdf)


# Setup of the SUDS system plus test data.


## Quick setup of the system plus test database

This assumes that you are using Sails 1.4.x.  The script copies over the new files, plus modified versions of a few files created for the starter application. For details of the files affected see the step by step instructions below.

Download the zip file from https://github.com/bobbrowning/suds-for-sails (the green button 'Code' - last option) and place it in the root directory for your sails applications. 

Unzip the file and run the bash installation script as follows.

```
unzip suds-for-sails-main.zip
bash suds-for-sails-main/sudscopytest.sh
```

1. Enter the app name  (say 'myapp')
1. Confirm that you are running sails 1.4.x
1. The script creates the sails app in the directory you provide. It then loads sails. 
1. You will see a picture of a yacht. **The install is not complete**.
1. Wait a few seconds then hit CTRL-C to close it down and complete the process. 
1. When complete, change directory to the generated app and lift sails.

```
cd myapp
sails lift
```

Then in a browser:  http://localhost:1337/admin  

You will be asked to log in. The superuser is admin@admin.com password admin (not recommended for production use!)

Alternative logins are 
* web@web.com password: web, permission set: web;
* sales@sales.com password: sales, pemission set: sales; 
* purchasing@purchasing.com password: purchasing, permission set: purchasing;
* willy@sales.com password: willy, permission set: sales;
* howard@wagner.com password howard, permission set admin.

## Step by step installation 

The procedure for installing the system step by step is [here](https://github.com/bobbrowning/suds-for-sails/blob/main/More_information/Manual-changes.md). 


## Get started


1. Edit the config/suds.js file and change the superuser email address to your email address.
1. Run http://localhost:1337/admin and register with this email address
1. Run http://localhost:1337/admin again and log in with the new email address you should see a setup menu
1. Edit the user table, find your new record and set up the Uset type to 'in-house' and person/business to person.

The test system uses the same table for logged-in users (in-house), external customers, suppliers or companies. There is a user type that shows which is which.  There is also a radio button to identify people or organisations.  If you want to add new password-protected users, register them first via the starter app, then go in and add this information to their record. 

Don't forget to validate the config files whenever you edit them. It doesn't pick up all errors, but the most common ones (at least the ones I make).





