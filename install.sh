#!/bin/bash
echo "Please enter the app name"
read appName
echo "MongoDB test database(M) or SQLite(S) "
read db
mv sudsjs-main $appName
cd ./$appName
pwd

if [ db != 'S' ]
then
    mongorestore --drop
    echo "MongoDB database restored"
fi
if [ db = 'S' ]
then
    mv tables tables.mongo
    mv cong conf.mongo
    mv tables.sql tables
    mv conf.sql conf
    echo "Usimng SQLite3 Database"
fi
npm install
echo "SUDS Installed - starting up"
kill -9 $(lsof -t -i:3000)
ech
node bin/www
echo "In your browser http://localhost:3000"
echo "To start:"
echo: "~$ cd $appName"
echo: "~$ node bin/www"
