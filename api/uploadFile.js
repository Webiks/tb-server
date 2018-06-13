const express = require('express');
const router = express.Router();
const  http = require('http');
const formidable = require('express-formidable');
const config = require('../config/configJson');
const { execSync } = require('child_process');          // for using the cURL command line

const app = express();

const opts = {
    encoding: 'utf-8',
    maxFileSize: config.maxFileSize,
    uploadDir: './api/uploads/',
    multiples: true, // req.files to be arrays of files
    keepExtensions: true
};
app.use(formidable(opts));

app.post('/:worldName/rasters', (req, res) => {
    // req.fields; // contains non-file fields
    // req.files; // contains files
    const workspaceName = req.params.worldName;
    console.log("dirname: " + JSON.stringify(__dirname));
    console.log("files: " + JSON.stringify(req.files));
    console.log("req url: " + JSON.stringify(req.url));
    console.log("req method: " + JSON.stringify(req.method));
    console.log("options: " + JSON.stringify(opts));

    opts.uploadDir = './api/uploads/rasters';
    const form = new formidable.IncomingForm(opts);
    console.log("Form uploadDir: " + form.uploadDir);

    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // creating a form instance



        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });

        // define the file Path when the upload is starting
        /*
        form.on('fileBegin', function (name, file){
            file.path = __dir__ + '/uploads/' + file.name;
            console.log('fileBegin: file path ' + file.path);
        });*/

        // show the upload progress by percent
        form.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
        });

        /*
        form.on('file', function (name, file){
            console.log('Uploaded ' + file.name);
        });*/

        // when the upload is finished
        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            // let temp_path = this.openedFiles[0].path;
            let temp_path = req.files.uploadRaster.path;
            /* The file name of the uploaded file */
            // let file_name = this.openedFiles[0].name;
            let file_name = req.files.uploadRaster.name;
            /* Location where we want to copy the uploaded file */
            let new_path = form.uploadDir + file_name;

            // saving the file to a local dir
            fs.rename(temp_path, new_path, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("success to save the file to a local dir!");
                }
            });

            // adding the GeoTiff file to the workspace in geoserver using the cURL command line:
            // 0. create the JSON file with the desire workspace
            const importJsonPath = `${__dirname}\\json\\import.json`;

            const importObj = {
                import:{
                    targetWorkspace: {
                        workspace: {
                            name: workspaceName
                        }
                    }
                }
            };

            console.log(JSON.stringify(importObj));
            console.log("writeFile..." + importJsonPath);

            fs.writeFile(importJsonPath, JSON.stringify(importObj), 'utf8', err => {
                if (err) return console.error(err);
                console.log('complete to write the import JSON file!');
            });

            console.log("starting the cURL...");

            // 1. create a empty import with no store as the target
            const curl_createEmptyImport =
                `curl -u admin:geoserver -XPOST -H "Content-type: application/json" -d @${importJsonPath} "http://localhost:8080/geoserver/rest/imports"`;

            const stepOne = execSync(curl_createEmptyImport);
            console.log("step 1 is DONE...");
            console.log("stepOne: " + stepOne.toString());

            const importFromJson = JSON.parse(stepOne);
            console.log("importFromJson: " + JSON.stringify(importFromJson));
            let task = importFromJson.import.id;
            console.log("task: " + task);

            // 2. POST the GeoTiff file to the tasks list, in order to create an import task for it
            const curl_postToTaskList =
                `curl -u admin:geoserver -F name=test -F filedata=@${new_path} "http://localhost:8080/geoserver/rest/imports/${task}/tasks"`;

            const stepTwo = execSync(curl_postToTaskList);
            console.log("step 2 is DONE..." + stepTwo);

            // 4. execute the import
            const curl_execute = `curl -u admin:geoserver -XPOST "http://localhost:8080/geoserver/rest/imports/${task}"`;

            const stepSix = execSync(curl_execute);
            console.log("step 6 is DONE..." + stepSix);

            console.log("DONE!");

            // 5. remove the file from the local store
            fs.remove(new_path, err => {
                if (err) return console.error(err);
                console.log(`the file ${file_name} was removed from ${form.uploadDir}!`);
            });

        });

        // catch en error
        form.on('error', function(err) {
            console.error(err);
        });

    }
});

module.exports = app;