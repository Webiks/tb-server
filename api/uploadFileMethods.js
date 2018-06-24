const express = require('express');
const config = require('../config/configJson');
const fs = require('fs-extra');
const { execSync } = require('child_process');          // for using the cURL command line

// setting the cURL commands line (name and password, headers, request url)
const baseCurl = config.baseCurl;
const curlContentTypeHeader = '-H "Content-type: application/json"';
const curlAcceptHeader = '-H  "accept: application/json"';
const reqCurl = config.baseUrlGeoserverImports;

module.exports = function() {
    this.setOptions = (uploadDir) => {
        return {
            encoding: 'utf-8',
            maxFileSize: config.maxFileSize,
            uploadDir: uploadDir,
            multiples: true, // req.files to be arrays of files
            keepExtensions: true
        };
    };

    this.findFileType = (reqType) => {
        const splitReqType = (reqType).split('/');
        if (splitReqType[1] === 'tiff' || splitReqType[1] === 'tif' ){
            return 'raster';
        }
        else{
            return 'vector';
        }
    };

    this.renameFile = (temp_path, new_path) => {
        fs.rename(temp_path, new_path, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log(`success to save the '${new_path}'!`);
            }
        });
    };

    this.removeFile = (filePath) => {
        fs.remove(filePath, err => {
            if (err) return console.error(err);
            console.log(`the file '${filePath}' was removed!'`);
        });
    };

    this.writeFile = (dirpath, file) => {
        fs.writeFile(dirpath, JSON.stringify(file), 'utf8', err => {
            if (err) return console.error(err);
        });
    };

    this.createImportObject = (workspaceName) => {
        return {
            import: {
                targetWorkspace: {
                    workspace: {
                        name: workspaceName
                    }
                }
            }
        };
    };

    this.createImportObjectWithData = (workspaceName, filePath) => {
        const importObject = this.createImportObject(workspaceName);
        const data = {
            type: 'file',
            file: filePath
        };
        console.log("import object with data");
        return { ...importObject, data};
    };

    this.uploadFileToGeoserverStepOne = (importJsonPath) => {
        console.log("starting the cURL...");
        // 1. create a empty import with no store as the target
        const curl_createEmptyImport = `${baseCurl} -XPOST ${curlContentTypeHeader} -d @${importJsonPath} ${reqCurl}"`;
        console.log("step 1 is DONE...");
        return execSync(curl_createEmptyImport);
    };

    this.findImportId = (curl) => {
        // find the import ID
        const importFromJson = JSON.parse(curl);
        console.log("importFromJson: " + JSON.stringify(importFromJson));
        return importFromJson.import.id;
    };

    this.sendToTask = (filepath, filename, importId) => {
        //POST the GeoTiff file to the tasks list, in order to create an import task for it
        console.log("sendToTask: filepath: " + filepath);
        const curlFileData = `-F name=${filename} -F filedata=@${filepath}`;
        console.log("sendToTask: curlFileData: " + curlFileData);

        const curl_postToTaskList = `${baseCurl} ${curlFileData} ${reqCurl}/${importId}/tasks"`;
        const curl = execSync(curl_postToTaskList);
        console.log("sent to the Tasks Queue..." + curl);
    };

    this.executeFileToGeoserver = (importId) => {
        // execute the import task
        const curl_execute = `${baseCurl} -XPOST ${reqCurl}/${importId}"`;
        const execute = execSync(curl_execute);
        console.log("The execute is DONE..." + execute);
        console.log("DONE!");
    };

    this.deleteUncompleteImports = () => {
        // delete the task from the importer queue
        const curl_deletsTasks = `${baseCurl} -XDELETE ${curlAcceptHeader} ${curlContentTypeHeader} ${reqCurl}"`;
        const deleteTasks = execSync(curl_deletsTasks);
        console.log("Delete task from the Importer..." + deleteTasks);
        console.log("DONE!");
    };

    this.fileToZip = (filename, uploadPath) => {
        // define the layers parameters for the zip operation
        return [
            {
                content: '',
                name: filename,
                mode: 0o755,
                comment: '',
                date: new Date(),
                type: 'file' },
            {
                path: uploadPath,
                name: 'uploads'
            }
        ];
    };
};
