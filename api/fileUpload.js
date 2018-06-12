const express = require('express');
const formidable = require('express-formidable');

const app = express();

app.use(formidable());

app.post('/upload', (req, res) => {
    req.fields; // contains non-file fields
    req.files; // contains files
});

module.exports = app;