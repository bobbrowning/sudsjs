const passport=require('passport');
const localStrategy=require('passport-local').localStrategy;
const getRow=require('../bin/suds/get-row');

const customFields = {
    usernameField: 'emailAddress',
    passwordField: 'password',
}

const verifyCallback= (username,password,done) => {
    getRow('user',username,'emailAddress').then ((useRec) => { 
   if (userRec.err) {return done(null,false)}
   const isValid= validatePassword(password,userRec.password,userRec.salt)
   if (isValid) {return done(null, userRec)} else {return(null,false)}
    });
};


const strategy=new localStrategy();

passport.use(





);