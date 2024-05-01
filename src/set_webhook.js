const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');

const body = JSON.stringify({
    "action": "setupWebhook",
    "url": process.env.URL, // enter your url
    "deviceList": "ALL"
});

sendRequest(returnOptions(`/v1.1/webhook/setupWebhook`, 'POST'), body);
console.log("Request sent.");