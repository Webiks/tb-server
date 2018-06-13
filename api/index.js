const express = require('express');
const router = express.Router();
const worlds = require('./worlds');
const layers = require('./layers');
const uploadFile = require('./uploadFile');
const uploadMultipart = require('./uploadMultipart');

router.use('/worlds', worlds);
router.use('/layers', layers);
router.use('/upload', uploadFile);
// router.use('/upload', uploadMultipart);

module.exports = router;
