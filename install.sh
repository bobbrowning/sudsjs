#!/bin/bash
echo "Please enter the app name"
read appName
pwd

mv sudsjs-main $appName
cd ./$appName
pwd
npm install 
echo "SUDS Installed - starting up"
node bin/www
echo "In your browser http://localhost:3000"
echo "To start:"
echo: "~$ cd $appName"
echo: "~$ node bin/www"
