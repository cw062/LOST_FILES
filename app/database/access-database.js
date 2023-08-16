const express = require('express');
const mysql = require('mysql');
const pool = mysql.createPool({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.MYSQL_DB,
    port: process.env.RDS_PORT
  });

const checkDatabaseForUsername = (username) => {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let values = [username];
      connection.query('SELECT * FROM Users WHERE username = ?', [values], function (err, result) {
        if(err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    connection.release();
    });
  });
}

const storeUserInfo = (username, hash, salt) => {
  return new Promise( resolve => {
    pool.getConnection(function(err, connection) {
      if(err) {
        console.error("Database connection failed" + err.stack);
        return;
      }
      let sqlstring = 'INSERT INTO Users (username, password, salt) VALUES (?)';
      let values = [username, hash, salt];
      connection.query(sqlstring, [values], function (err, result) {
        if(err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    connection.release();
    });
  });
}








module.exports = {
    checkDatabaseForUsername,
    storeUserInfo
};