"use strict"

const http = require('http');
const querystring = require('querystring');
const url = require('url');
const client = require('./client');

const PORT = (process.env && process.env.PORT) || 3000;

function handler(req, res) {
    let data = '';
    switch (req.method){
        case 'POST':
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                data = parse(data, req.headers['content-type']);
                process(data, res);
            });
            break;
        case 'GET':
            data = url.parse(req.url, true).query;
            process(data, res);
            break;
        default:
            writeNotAllowed(res);
            break;
    }
}

function parse(data, type) {
    switch (type) {
        case 'application/json':
            data = JSON.parse(data);
            break;
        case 'application/x-www-form-urlencoded':
            data = querystring.parse(data);
            break;
    }
    return data;
}

function process(data, res){
    if (isCompleteData(data)){
        client.send(data, (err, resp) => {
            if (err) return writeError(res, 500, err.message);

            data.secretKey = resp.hash;
            writeOK(res, JSON.stringify(data));
        });
    }else
        return writeBadRequest(res);
}

function isCompleteData(data){
    return (data && data.firstName && data.lastName);
}

function writeOK(res, data){
    res.writeHead(200, 'OK', {'Content-Type': 'application/json'});
    res.write(data);
    res.end();
}

function writeError(res, code, name){
    console.error(name);
    res.writeHead(code, name);
    res.end();
}

function writeNotAllowed(res){
    writeError(res, 405, 'Method Not Allowed');
}

function writeBadRequest(res){
    writeError(res, 400, 'Bad Request');
}

const server = http.createServer();
server.on('error', err => console.error(err));
server.on('request', handler);
server.on('listening', () => {
    console.log('Start HTTP on port %d', PORT);
});
server.listen(PORT);