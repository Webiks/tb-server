const config = require('../config/configJson');
const express = require('express');
const checkAuth = require('./check-auth');
const router = express.Router();

router.post('/checkAuth', checkAuth, (req, res) => {
    res.send('o.k');
});

router.post('/login', (req, res) => {
  if (req.body.username.trim().toLowerCase() === config.login.username && req.body.password.trim().toLowerCase() === config.login.password) {
    req.session.authenticated = true;
    res.send('o.k');
  } else {
    res.status(401).send('unAuthorized')
  }
});

router.post('/logout', (req, res, next) => {
    req.session.authenticated = false;
    res.send('o.k');
});

module.exports = router;
