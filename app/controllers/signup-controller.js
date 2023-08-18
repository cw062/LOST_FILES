const express = require('express');
const { hashPassword, createLocalFolder } = require('../services/signup-services');
const { storeUserInfo, checkDatabaseForUsername } = require('../database/access-database');
const serveSignupPage = (req, res) => {
    res.render('SignUp');
};

const handleSignup = async (req, res) => {
    let hashAndSalt = await hashPassword(req.body.pass);
    let result = await storeUserInfo(req.body.username, hashAndSalt.hash, hashAndSalt.salt);    //true for succcess, false for fail
    if (result) {
      //isLoggedin = true;
      //need to get created uid and assign it to activeuid
      let dbrow = await checkDatabaseForUsername(req.body.username);
      req.session.user = dbrow[0].uid;
      //loggedInUsers.push(req.session.user);
      createLocalFolder(req.session.user);
      res.redirect('../');
    } else {
      res.render('Signup', {root: __dirname});
    }
}

module.exports = {
    serveSignupPage,
    handleSignup
};