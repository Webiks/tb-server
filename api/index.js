const express = require('express');
const router = express.Router();
const worlds = require('./worlds');
const layers = require('./layers');
const fileUpload = require('./fileUpload');

router.use('/worlds', worlds);
router.use('/layers', layers);
router.use('/fileUpload', fileUpload);

module.exports = router;
