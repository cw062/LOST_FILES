const express = require('express');
const crypto = require('crypto');
  
const isPasswordCorrect = (savedHash, savedSalt, savedIterations, passwordAttempt) => {
    //retreive row from db --probably rename these parameters
    let newhash = "";
    return new Promise(resolve => {
      crypto.pbkdf2(passwordAttempt, savedSalt, savedIterations, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        newhash = derivedKey.toString('hex'); 
        resolve(savedHash == newhash);
      });
    });
  }

  module.exports = {
    isPasswordCorrect
  };