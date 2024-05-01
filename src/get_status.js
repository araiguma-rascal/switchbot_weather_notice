const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');
const deviceId = process.env.DEVICE_ID;

sendRequest(returnOptions(`/v1.1/devices/${deviceId}/status`, 'GET'), null);