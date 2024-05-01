const crypto = require('crypto');
require('dotenv').config();

module.exports = function returnOptions(path, method) {
    const t = Date.now();
    if (!process.env.TOKEN || !process.env.SECRET) {
        console.error("Cannot find your TOKEN and SECRET. Please check your .env file.");
        process.exit(1);
    }
    const token = process.env.TOKEN;
    const secret = process.env.SECRET;
    const nonce = "requestID";
    const data = token + t + nonce;
    const signTerm = crypto.createHmac('sha256', secret)
        .update(Buffer.from(data, 'utf-8'))
        .digest();
    const sign = signTerm.toString("base64");

    return {
        hostname: 'api.switch-bot.com',
        port: 443,
        path: path,
        method: method,
        headers: {
            "Authorization": token,
            "sign": sign,
            "nonce": nonce,
            "t": t,
            'Content-Type': 'application/json',
        },
    };
};