const https = require('https');

module.exports = function sendRequest(options, body) {
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);
        res.on('data', d => {
            process.stdout.write(d);
        });
    });
    req.on('error', error => {
        console.error(error);
    });
    if (body != null) req.write(body);
    req.end();
}