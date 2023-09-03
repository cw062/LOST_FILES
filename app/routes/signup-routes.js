const express = require('express');
const router = express.Router();
const { serveSignupPage, handleSignup } = require('../controllers/signup-controller');

router.get('/', serveSignupPage);
router.post('/', handleSignup);
module.exports = router;