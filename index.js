const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const JSONStream = require('JSONStream');
const bodyParser = require('body-parser');

/*app.use(bodyParser.urlencoded({ extended: true}));
const dbDirName = 'outposts';
const dbFileName = `${dbDirName}.json`;*/

// GET the list data
/*app.get('/', (req, res) => {
    // reading the JSON file
    var readable = fs.createReadStream(dbFileName);
    return readable.pipe(res);
})*/

// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    console.log(sampleFile);
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./store/' + sampleFile.name, function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });
});

/*app.get('/', (req, res) => res.send("example to express server"));*/

// create the server on port 3000
var server = app.listen(3000, () => console.log(`server running at http://localhost: ${server.address().port}`));

