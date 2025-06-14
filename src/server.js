const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const returnOptions = require('./returnOptions.js');
const sendRequest = require('./sendRequest.js');

let url = "https://www.jma.go.jp/bosai/forecast/data/forecast/270000.json";
const deviceId = process.env.DEVICE_ID;

const sleep = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));

const returnBody = (command, parameter) => {
    return JSON.stringify({
        "command": command,
        "parameter": parameter,
        "commandType": "command"
    });
};

var time_prev = Date.now();
var status_prev = "OFF";

app.use(express.json()); // By default, req.body is undefined. To parse JSON, add this line.
app.post("/", (req, res) => {
    const data = req.body; // 受信したJSONデータはreq.bodyに入っています

    console.log('Received webhook data:', JSON.stringify(data, null, 2)); // デバッグ用に整形して出力

    // 1. 'context' オブジェクトと 'deviceType' フィールドが存在するか確認
    if (data && data.context && data.context.deviceType) {
        const deviceType = data.context.deviceType;
        const deviceMac = data.context.deviceMac; // MACアドレスも取得可能
        const eventType = data.eventType;

        if (deviceType === 'WoPresence' && eventType === 'changeReport') {
            const detectionState = data.context.detectionState; // 'detected' or 'notDetected'

            console.log(`WoPresence イベントを受信しました。検出状態: ${detectionState}`);

            // 人が検出された時 (detectionState === 'detected') にColor BulbをONにする
            if (detectionState === 'DETECTED') {
                console.log('人が検出されました！Color BulbをONにします。');
                sendRequest(returnOptions(`/v1.1/devices/${deviceId}/commands`, 'POST'), returnBody("turnOn", "default"));
                res.status(200).json({ status: 'success', message: 'WoPresence detected, Color Bulb ON command sent' });
            } else {
                console.log('人が検出されていません。Color Bulbは操作しません。');
                // 人がいない場合はOFFにするなど、必要に応じてここに処理を追加
                res.status(200).json({ status: 'ignored', message: 'WoPresence not detected' });
            }
        } else if (deviceType === 'WoBulb') {
            console.log(`これはColor Bulbからのイベントです (MAC: ${deviceMac})`);
            const status = req.body.context.powerState;
            const time = Date.now();
            console.log(`Change detected! Prev status is ${status_prev}. Current status is ${status}!`);
            console.log(`Prev time is ${time_prev}. Current time is ${time}.`);
            //1分以上経過 かつ OFFからONに変化した場合
            if (status == "ON" && status_prev == "OFF" && time > time_prev + 1000 * 1) {
                console.log(`Light turned ${status}!`);
                // set time_prev to current time
                time_prev = time;
                fetch(url)
                    .then(response => {
                        return response.json();
                    })
                    .then(weather => {
                        let weathers = weather[0].timeSeries[0].areas[0].weathers;
                        let timeSeries = weather[0].timeSeries[0].timeDefines;
                        for (let i = 0; i < timeSeries.length - 1; i++) {
                            console.log(timeSeries[i] + "の天気は" + weathers[i] + "です。");
                        }
                        const hour = new Date().getHours();
                        console.log("現在時刻は" + hour + "時です。");
                        if (hour >= 18 && weathers[1].includes("雨")) {
                            console.log("明日の天気は" + weathers[1] + "です。");
                            return true;
                        } else if (hour < 18 && weathers[0].includes("雨")) {
                            console.log("今日の天気は" + weathers[0] + "です。");
                            return true;
                        } else {
                            console.log("直近に雨はありません。")
                            return false;
                        }
                    }).then(isRain => {
                        if (isRain) {
                            sendRequest(returnOptions(`/v1.1/devices/${deviceId}/commands`, 'POST'), returnBody("setColor", "102:237:255"));
                            console.log("Blue Light Set!");
                        } else {
                            sendRequest(returnOptions(`/v1.1/devices/${deviceId}/commands`, 'POST'), returnBody("setColor", "255:102:102"));
                            console.log("Red Light Set!");
                        }
                        return sleep(500);
                    }).then(() => {
                        sendRequest(returnOptions(`/v1.1/devices/${deviceId}/commands`, 'POST'), returnBody("setBrightness", 100));
                        console.log("Brightness Set!");
                        return sleep(500);
                    }).then(() => {
                        sendRequest(returnOptions(`/v1.1/devices/${deviceId}/commands`, 'POST'), returnBody("setColorTemperature", 6000));
                        console.log("Color Temperature Set!");
                    }).catch(error => {
                        console.log(error);
                    });
            };
            status_prev = status;

            // SwitchBotからのWebhookは、成功を知らせるHTTP 200 OKを期待します
            res.status(200).json({ status: 'success', message: 'Color Bulb event processed' });

        } else {
            console.log(`これはColor BulbやMotion Sensor以外のデバイス (${deviceType}) からのイベントです。処理をスキップします。`);
            res.status(200).json({ status: 'ignored', message: 'Not a Color Bulb event' });
        }
    } else {
        console.log('不正なWebhookデータ形式です（必要なフィールドが見つかりません）。');
        res.status(400).json({ status: 'error', message: 'Invalid webhook data format' });
    }

});

app.listen(PORT, () => {
    console.log(`Node.js is listening to PORT: ${PORT}`);
});