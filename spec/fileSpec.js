const request = require('request');
const express = require('express');

const config = {
    port: 3000,
    filestore: 'uploads'
};

let createApp = require('./../collector/app');

let conn = {
    query: (q, v) => { 
        console.log('query', q, v);
        return Promise.resolve({insertId: 'good'});
    }
};

describe('handler file', () => {
    it('should return 200 response code on post file api/file/', (done) => {

        let kue = {};
        let formData = {
            file: require('fs').createReadStream(__dirname + '/1.gif')
        };

        let app = createApp({conn, kue, config});
        
        let s = app.listen(config.port, () => {
            let url = 'http://localhost:' + config.port + '/api/file';
            
            request.post({url, formData}, (error, response) => {
                expect(response.statusCode).toEqual(200);                
                s.close(done);
            });
        });
    });

});