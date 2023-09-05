const express = require('express');
const crypto = require('crypto');
const fs = require('fs');

let iterations = 10000;
const hashPassword = (password) => {
    let returnobj = {
      hash: "",
      salt: ""
    };
    return new Promise(resolve => {
      returnobj.salt = crypto.randomBytes(128).toString('base64');
      crypto.pbkdf2(password, returnobj.salt, iterations, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        returnobj.hash = derivedKey.toString('hex'); 
        resolve(returnobj);
      });
    });
}

const createLocalFolder = (id) => {
    fs.mkdir(process.cwd() + '/public/uploads/' + id, (error) => {
        if (error) {
          console.log(error);
        }
      });
};

  module.exports = {
    hashPassword,
    createLocalFolder
  }