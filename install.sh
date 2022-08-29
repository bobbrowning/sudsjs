#!/bin/bash
echo "Please enter the app name"
read appName
pwd
mv sudsjs-main $appName
cd ./$appName
pwd
mongorestore --drop
echo "database restored"
kill -9 $(lsof -t -i:3000)
echo "port 3000 cleared"
npm install 
echo "SUDS Installed - starting up"
node bin/www
echo "In your browser http://localhost:3000"
echo "To start:"
echo: "~$ cd $appName"
echo: "~$ node bin/www"
