const https = require('https');
const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');

const body = JSON.stringify({
    "action": "updateWebhook",
    config: {
        "url": process.env.URL, // enter your new http (not https) url here
        "enable": true
    }
});
sendRequest(returnOptions(`/v1.1/webhook/updateWebhook`, 'POST'), body);
console.log("Request sent.");