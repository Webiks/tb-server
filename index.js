var multiparty = require('multiparty');
var http = require('http');
var util = require('util');

const port = 3000;

http.createServer(function(req, res) {
    if (req.url === '/upload' && req.method === 'POST') {
        console.log("new form: req  %s", req);

        // parse a file upload
        let count = 0;
        const form = new multiparty.Form();

        form.uploadDir = '../store';
        console.log("new form: upload Dir = " + form.uploadDir);

        // Parse req
        form.parse(req, function(err, fields, files) {
            console.log("new form: File name = " + files.toString());
            //console.log("new form: File name = " + files.get);

            Object.keys(fields).forEach(function(name) {
                console.log('formParse: got field named ' + name);
            });

            Object.keys(files).forEach(function(name) {
                console.log('formParse: got file named ' + name);
                //console.log("formParse: value = " + value);
                //console.log("formParse: filename = " + filename);
            });

            console.log('formParse: Upload completed!');

            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end('Received ' + count + ' files');

        });

        return;
    }

    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
}).listen(port, () => console.log(`server running at http://localhost: ${port}`));