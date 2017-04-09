"use strict"

const http = require('http');
const querystring = require('querystring');

const OPTIONS = {
    hostname: 'netology.tomilomark.ru',
    port: 80,
    path: '/api/v1/hash',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

function handler(response, callback) {
    if (response.statusCode !== 200) {
        return callback(new Error(response.statusMessage));
    }
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => callback(null, JSON.parse(data)));
}

function send(data, callback){
    var body = Object.create(data);
    delete body.firstName;

    let request = http.request(OPTIONS);
    request.setHeader('firstname', data.firstName);
    request.write(JSON.stringify(body));
    request.on('error', err => callback(err));
    request.on('response', (response) => {
        handler(response, callback);
    });
    request.end();
}

module.exports = {
    send
}