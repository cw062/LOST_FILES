const express = require('express');
const { isPasswordCorrect } = require('../services/login-services');
const { checkDatabaseForUsername } = require('../database/access-database');
let iterations = 10000;
let loggedInUsers = [];


const serveLoginPage = (req, res) => {
    res.render('Login', {data: "No message"});
    console.log(req.session);
};


const handleLoginAttempt = async (req, res) => {
    //get row from db that matches username
    let dbrow = await checkDatabaseForUsername(req.body.username);
    
    if (dbrow == 0) {
        res.render('Login', {data: "Username Incorrect"});
    }
    else if (!(await isPasswordCorrect(dbrow[0].password, dbrow[0].salt, iterations, req.body.pass))) {
        res.render('Login', {data: "Password Incorect"});
    }
    else if(loggedInUsers.includes(dbrow[0].uid)) {
        res.render('Login', {data: "Account already logged in on another device"});
    }
    else {
        req.session.user = dbrow[0].uid;
        //loggedInUsers.push(req.session.user);
        req.session.save(function (err) {
            if (err)
            return next(err)
        });
        res.redirect('../');
    }
}


module.exports = {
    serveLoginPage,
    handleLoginAttempt
};