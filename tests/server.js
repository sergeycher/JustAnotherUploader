var http = require('http'),
    fs = require('fs'),
    url = require("url"),
    multiparty = require('multiparty'),
    ncp = require('ncp').ncp,
    path = require('path');

ncp.limit = 16;

var currentId = 0;

(function() {
    var HOST = 'localhost',
        PORT = '1337',
        ROOT = '..';

    var sendFile = function(path, response) {
        fs.stat(path, function(error, stats) {
            if (error) {
                if (error.code == "ENOENT") {
                    response.writeHead(404);
                } else {
                    response.writeHead(500, error.toString());
                }
            } else {
                fs.readFile(path, "utf8", function(error, text) {
                    if (error) {
                        console.log(path);
                        throw error;
                    }
                    response.writeHead(200, {
                        'Content-Type': require("mime").lookup(path)
                    });
                    response.write(text);
                    response.end('\n');
                });
            }
        });
    };

    var placeFile = function(tmpPath, callback) {
        console.log('upload ', tmpPath);
        callback || (callback = function(err, newPath) {});

        var stat = fs.stat(tmpPath, function(error, stats) {
            var basename = path.basename(tmpPath);
            var newPath = './uploads/' + basename;

            ncp(tmpPath, newPath, function(err) {
                callback(err, newPath);
                if (err) {
                    return console.error(err);
                }
            });
        });
    };

    http.createServer(function(request, response) {
        var filePath = "",
            pathname = url.parse(request.url).pathname,
            content;

        if (request.method === 'POST') {
            // parse a file upload 
            var form = new multiparty.Form();

            form.on('file', function(name, file) {
                placeFile(file.path, function(err, path) {
                    response.writeHead(200, {
                        'content-type': 'text/html; charset=UTF-8'
                    });
                    var data = {
                        id: (++currentId),
                        url: path
                    };
                    response.write(JSON.stringify(data));
                    response.end();
                });
            });
        };

        if (request.method === 'GET') {
            if (pathname === '/') {
                content = 'index.html';
            } else {
                content = ROOT + pathname;
            }

            request.setEncoding("utf8");
            sendFile(content, response);
        };
    }).listen(PORT, HOST);
    console.log('Server running at http://' + HOST + ':' + PORT);
})();
