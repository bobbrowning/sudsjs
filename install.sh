#!/bin/bash
echo "Please enter the app name"
read appName
pwd

mv suds-express-demo-main $appName
rm suds-express-demo-main.zip
cd ./$appName
pwd
npm install 
echo "SUDS Installed"
echo "1. cd $appName"
echo "2. In your browser http://localhost:3000/admin"
echo "3. log in with admin@admin.com, password admin"
