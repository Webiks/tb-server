const express = require('express');
const router = express.Router();
const formidable = require('express-formidable');
const config = require('../config/configJson');
const fs = require('fs-extra');
const { execSync } = require('child_process');          // for using the cURL command line
// const archiver = require('archiver');
const path = require('path');
const zip = require('express-easy-zip');
require('./uploadFileMethods')();

const app = express();

const uploadDir = '/public/uploads/';
const dirPath = __dirname.replace(/\\/g, "/");
const uploadPath = `${dirPath}${uploadDir}`;
const jsonPath = `${dirPath}/public/json/`;
console.log("dirPath: " + dirPath);
console.log("uploadPath: " + uploadPath);
console.log("jsondPath: " + jsonPath);

const opts = setOptions(uploadPath);
console.log("opts: " + JSON.stringify(opts));
app.use(formidable(opts));
app.use(zip());

app.post('/:worldName', (req, res) => {
    const workspaceName = req.params.worldName;
    // const fileType = req.params.fileType;
    const reqFiles = req.files.uploads;
    let fileType = '';
    const filesToZip = [];
    let filePath = '';
    let filename = '';

    console.log("req files: " + JSON.stringify(reqFiles));
    console.log("req length: " + reqFiles.length);

    if (!reqFiles.length){
        fileType = findFileType(reqFiles.type);             // find the file type
        filename = reqFiles.name;
        filePath = uploadPath + filename;
        console.log("filePath: " + filePath);
        renameFile(reqFiles.path, filePath);     // renaming the files full path
        loadToGeoserver();
    }
    else {
        const splitName = (reqFiles[0].name).split('.');
        filename = `${splitName[0]}.zip`;
        filePath = uploadPath + filename;
        console.log("filePath: " + filePath);
        const filesToZip = [];

        // saving all the files in a local directory by mapping the req.files array
        reqFiles.map(file => {
            console.log("req file name: " + file.name);
            fileType = findFileType(file.type);                // find the file type
            renameFile(file.path, filePath);       // renaming the files full path

            // define the layers parameters for the zip operation
            const fileToZip = [
                {
                    content: '',
                    name: file.name,
                    mode: 0o755,
                    comment: '',
                    date: new Date(),
                    type: 'file' },
                {
                    path: uploadPath,
                    name: 'uploads'
                }
            ];

            filesToZip.push(fileToZip);
            //filesToZip.push(fileToZip(file.name, uploadPath));
        });

        // compressing all the files to a single zip file
        console.log("filesToZip: " + JSON.stringify(filesToZip));
        // compressing all the files to a single zip file
        res.zip({
            files: filesToZip,
            filename: filename
            })
            .then( success => {
                console.log(`succeed to zip the files to ${filename}`);
                loadToGeoserver();
            })
            .catch(function(err){
                console.log(err);	//if zip failed
            });

        // zipFiles(res, filename, reqFiles);
        // loadToGeoserver();
        // console.log("filesToZip: " + JSON.stringify(filesToZip));
        // zipFiles(res, filesToZip, filename);

    }

    /*
    function zipFiles(res, filePath, filesToZip) {
        const archive = archiver('zip');

        archive.on('error', function(err) {
            res.status(500).send({error: err.message});
        });

        //on stream closed we can end the request
        archive.on('end', function() {
            console.log('Archive wrote %d bytes', archive.pointer());
        });

        //set the archive name
        res.attachment(filePath);

        //this is the streaming magic
        archive.pipe(res);

        const files = filesToZip;

        for(const i in files) {
            archive.file(files[i], { name: path.basename(files[i])});
        }

        archive.finalize();
    };*/

    // adding the GeoTiff file to the workspace in geoserver using the cURL command line:
    function loadToGeoserver() {
        // 0. create the JSON file with the desire workspace
        let importObj = {};
        if (fileType === 'raster') {
            importObj = createImportObject(workspaceName, filename);
        }
        else{
            importObj = createImportObjectWithData(workspaceName, filename);
        }
        console.log(JSON.stringify(importObj));
        console.log("writeFile..." );
        const importJsonPath = `${jsonPath}/import.json`;
        writeFile(importJsonPath, JSON.stringify(importObj));
        console.log('complete to write the import JSON file!');

        // 1. create a empty import with no store as the target
        const curl_stepOne = uploadFileToGeoserverStepOne(importJsonPath);
        console.log("stepOne: " + curl_stepOne.toString());

        // find the import id
        const importId = findImportId(curl_stepOne);
        console.log("importId: " + importId);

        // 2. POST the file to the tasks list, in order to create an import task for it         
        sendToTask(filePath, filename, importId);

        // 3. execute the import task
        executeFileToGeoserver(importId);

        // 4. remove all the file from the local store + the zip file
        if (reqFiles.length > 1) {
            reqFiles.map(file => removeFile(filePath));
        }
        // remove the zip file
        removeFile(filePath);

        // 5. delete all the uncompleted tasks in the import queue
        deleteUncompleteImports();
    }

});

module.exports = app;