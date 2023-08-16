const express = require('express');
const { serveLoginPage, handleLoginAttempt } = require('../controllers/login-controller');
const router = express.Router();

router.get('/', serveLoginPage);
router.post('/', handleLoginAttempt);
module.exports = router;