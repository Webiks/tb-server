const   formidable = require('formidable'),
        http = require('http'),
        util = require('util'),
        fs   = require('fs-extra');

const port = 3000;

http.createServer(function(req, res) {
    /* Process the form uploads */
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // set the max File Size to 2 GB
        const opts = {
            maxFileSize: 2000 * 1024 * 1024,
            uploadDir: './store/'
        }
        const form = new formidable.IncomingForm(opts);

        form.parse(req, function(err, fields, files) {
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });

        form.on('progress', function(bytesReceived, bytesExpected) {
            var percent_complete = (bytesReceived / bytesExpected) * 100;
            console.log(percent_complete.toFixed(2));
        });

        form.on('error', function(err) {
            console.error(err);
        });

        form.on('end', function(fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;
            /* Location where we want to copy the uploaded file */
            var new_path = form.uploadDir + file_name;

            fs.rename(temp_path, new_path, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("success!")
                }
            });
        });

        return;
    }

    // Display the file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
}).listen(port, () => console.log(`server running at http://localhost: ${port}`));