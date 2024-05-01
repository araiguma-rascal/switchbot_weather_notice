const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');

const body = JSON.stringify({
    "action": "queryUrl"
});

sendRequest(returnOptions(`/v1.1/webhook/queryWebhook`, 'POST'), body);
console.log("Request sent.");