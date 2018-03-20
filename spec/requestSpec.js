/* global describe, expect, it, beforeEach */

const hippie = require('hippie-swagger')
const SwaggerParser = require('swagger-parser')
const fs = require('fs')
const path = require('path')
const jsyaml = require('js-yaml')

let createApp = require('../collector/app')

let dereferencedSwagger

describe('App', () => {
  beforeEach((done) => {
    let spec = fs.readFileSync(path.join(__dirname, './../collector/api.yaml'), 'utf8')
    let swaggerDoc = jsyaml.safeLoad(spec)

    let parser = new SwaggerParser()
    parser.dereference(swaggerDoc, (err, derefSwagger) => {
      if (err) console.log(err)
      dereferencedSwagger = derefSwagger
      done()
    })
  })

  it('log pass good', (done) => {
    var conn = {
      query: (q, v) => {
        console.log('query', q, v)
        return Promise.resolve({insertId: 'good'})
      }
    }
    let config = {filestore: ''}
    let kue
    let app = createApp({conn, kue, config})

    hippie(app, dereferencedSwagger)
      .json()
      .post('/api/log/{key}')
      .pathParams({
        key: '1234'
      })
      .send({
        number: 456987
      })
      .end(function (err, res, body) {
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual('{"result":"success","id":"good"}')
        if (err) done(err)
        done()
      })
  })

  it('log pass good with auth', (done) => {
    var conn = {
      query: (q, v) => {
        console.log('query', q, v)
        return Promise.resolve({insertId: 'good'})
      }
    }
    let config = {filestore: '', auth: {users: {test: 'test'}}}
    let kue
    let app = createApp({conn, kue, config})

    hippie(app, dereferencedSwagger)
      .json()
      .auth('test', 'test')
      .post('/api/log/{key}')
      .pathParams({
        key: '1234'
      })
      .send({
        number: 456987
      })
      .end(function (err, res, body) {
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual('{"result":"success","id":"good"}')
        if (err) done(err)
        done()
      })
  })

  it('task pass good', (done) => {
    var conn = {
      query: (q, v) => {
        console.log('query', q, v)
        return Promise.resolve({insertId: 'good'})
      }
    }
    let config = {
      filestore: '',
      kue: {
        prefix: 'beebon_'
      }
    }
    let kue = {
      publish: () => {}
    }
    let app = createApp({conn, kue, config})

    hippie(app, dereferencedSwagger)
      .json()
      .post('/api/task/{key}')
      .pathParams({
        key: '1234'
      })
      .send({
        number: 456987
      })
      .end(function (err, res, body) {
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual('{"result":"success","id":"good"}')
        if (err) done(err)
        done()
      })
  })

  it('get status by task id', (done) => {
    var conn = {
      query: (q, v) => {
        console.log('query', q, v)
        return Promise.resolve([[{insertId: 'good', status: 'status'}]])
      }
    }
    let config = {
      filestore: '',
      kue: {
        prefix: 'beebon_'
      }
    }
    let kue = {
      publish: () => {}
    }
    let app = createApp({conn, kue, config})

    hippie(app, dereferencedSwagger)
      .json()
      .get('/api/task/{key}/id/{id}')
      .pathParams({
        key: '1234',
        id: 2
      })
      .send()
      .end(function (err, res, body) {
        console.log(res.statusCode)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual('{"status":"status","id":"2"}')
        if (err) done(err)
        done()
      })
  })
})
