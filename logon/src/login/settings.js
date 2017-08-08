/*!
 * emag.login
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

module.exports = {
  app: {
    client_id: '5a2c6a1043454b168e6d3e8bef5cbce2',
    name: 'foreworld.net',
    port: 8888,
  },
  cookie: {
    key: 'web',
    secret: 'login'
  },
  html: {
    virtualPath: '/client/',
  },
  activemq: {
    host: '127.0.0.1',
    port: 12613,
    user: 'admin',
    password: 'admin',
  },
  mysql: {
    database: 'emag2',
    host: '127.0.0.1',
    port: 12306,
    user: 'root',
    password: 'password',
    connectionLimit: 50
  },
  redis: {
    port: 12379,
    host: '127.0.0.1',
    password: '123456',
    database: 1
  }
};