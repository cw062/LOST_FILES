const express = require('express');
const { serveLoginPage, handleLoginAttempt, logoutRequest, initialRequest } = require('../controllers/login-controller');
const router = express.Router();

router.get('/Login', serveLoginPage);
router.post('/Login', handleLoginAttempt);
router.post('/Logout', logoutRequest);
router.get('/', initialRequest);
module.exports = router;