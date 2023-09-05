const express = require('express');
const { hashPassword, createLocalFolder } = require('../services/signup-services');
const { storeUserInfo, checkDatabaseForUsername } = require('../database/access-database');

const serveSignupPage = (req, res) => {
    res.render('SignUp', {data: 'No message'});
};

const handleSignup = async (req, res) => {
    let hashAndSalt = await hashPassword(req.body.pass);
    let result = await storeUserInfo(req.body.username, hashAndSalt.hash, hashAndSalt.salt);    
    if (result) {
      let dbrow = await checkDatabaseForUsername(req.body.username);
      req.session.user = dbrow[0].uid;
      req.session.newUser = true;
      createLocalFolder(req.session.user);
      res.redirect('../');
    } else {
      res.render('SignUp', {data: 'Username Already Taken'});
    }
}

module.exports = {
    serveSignupPage,
    handleSignup
};