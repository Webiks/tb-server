const express = require('express');
const router = express.Router();
const layers = require('./layers');

router.use('/layers', layers);

module.exports = router;
