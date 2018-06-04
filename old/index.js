const   formidable = require('formidable'),
        http = require('http'),
        util = require('util'),
        fs   = require('fs-extra');

const { execSync } = require('child_process');          // for using the cURL command line
const { port } = require('../config/config.json');

http.createServer(function(req, res) {
    /* Process the form uploads */
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // set the max File Size to 2 GB
        const opts = {
            maxFileSize: 20000 * 1024 * 1024,
            uploadDir: './store/'
        }
        const form = new formidable.IncomingForm(opts);

        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });

        // show the upload progress by percent
        form.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
        });

        form.on('error', function(err) {
            console.error(err);
        });

        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            let temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            let file_name = this.openedFiles[0].name;
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

            // adding the GeoTiff file to the 'tb' workspace in geoserver using the cURL command line:

            // 0. create the JSON file with the desire workspace
            let workspaceName = "tb";
            const importJsonPath = `${__dirname}\\json\\import.json`;
            /*const warpJsonPath = `${__dirname}\json\warp.json`;
            const gtxJsonPath = `${__dirname}\json\gtx.json`;
            const gadJsonPath = `${__dirname}\json\gad.json`;*/

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

            /* H O L D */
            // 3.  append the transformations to rectify (gdalwarp), retile (gdal_translate) and add overviews (gdaladdo) to it
            /*
            const curl_wrapTransform = `curl -u admin:geoserver -XPOST -H "Content-type: application/json" -d
            @${warpJsonPath} "http://localhost:8080/geoserver/rest/imports/${task}/tasks/0/transforms"`;
            const curl_gdalTranslate = `curl -u admin:geoserver -XPOST -H "Content-type: application/json" -d 
            @${gtxJsonPath} "http://localhost:8080/geoserver/rest/imports/${task}/tasks/0/transforms"`;
            const curl_overView = `curl -u admin:geoserver -XPOST -H "Content-type: application/json" -d 
            @${gadJsonPath} "http://localhost:8080/geoserver/rest/imports/${task}/tasks/0/transforms"`;

            const stepThree = execSync( curl_wrapTransform);
            console.log("step 3 is DONE..." + stepThree);
            const stepFour = execSync(curl_gdalTranslate);
            console.log("step 4 is DONE..." + stepFour);
            const stepFive = execSync(curl_overView);
            console.log("step 5 is DONE..." + stepFive);
            */

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


        return;
    }
    /*
    // Display the file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );*/
}).listen(port, () => console.log(`server running at http://localhost: ${port}`));
