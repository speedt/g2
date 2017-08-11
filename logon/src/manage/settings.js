/*!
 * emag.manage
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

module.exports = {
  app: {
    ver: 104,
    name: 'foreworld.net',
    port: 9999,
  },
  cookie: {
    key: 'web',
    secret: 'manage'
  },
  html: {
    virtualPath: '/manage/',
  },
  activemq: {
    host: '127.0.0.1',
    port: process.env.ACTIVEMQ_PORT || 12613,
    user: 'admin',
    password: process.env.ACTIVEMQ_PASS || 'admin',
  },
  mysql: {
    database: 'emag2',
    host: '127.0.0.1',
    port: process.env.MYSQL_PORT || 12306,
    user: 'root',
    password: process.env.MYSQL_PASS || 'password',
    connectionLimit: 50
  },
  redis: {
    port: process.env.REDIS_PORT || 12379,
    host: '127.0.0.1',
    password: '123456',
    database: 1
  }
};