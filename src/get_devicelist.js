const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');

sendRequest(returnOptions('/v1.1/devices', 'GET'), null);