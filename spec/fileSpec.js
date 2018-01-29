const request = require('request');
const HandlerFile = require('../collector/handlers/file');
const express = require('express');
const bodyparser = require('body-parser');

const config = {
    port: 3000,
    filestore: 'uploads'
}

var createApp = require('./../collector/app');

var conn = { 
    query: (q, v) => { 
        console.log('query', q, v)
        return Promise.resolve([{insertId: 'good'}]);
    }
}

describe('handler file', () => {
    it('should return 200 response code on post file api/file/', (done) => {

        var kue = {}
        var formData = {
            file: require('fs').createReadStream(__dirname + '/1.gif')
        };

        var app = createApp({conn, kue, config})
        
        var s = app.listen(config.port, () => {
            let url = 'http://localhost:' + config.port + '/api/file';
            
            request.post({url, formData}, (error, response) => {
                expect(response.statusCode).toEqual(200);                
                s.close(done);
            });
        });
    });

});