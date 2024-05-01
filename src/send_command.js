const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');

const body = JSON.stringify({
    "command": "turnOff",
    "parameter": "default",
    "commandType": "command"
});
const deviceId = process.env.DEVICE_ID;

sendRequest(returnOptions(`/v1.1/devices/${deviceId}/commands`, 'POST'), body);
console.log("Request sent.");