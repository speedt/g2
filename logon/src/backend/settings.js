/*!
 * emag.backend
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

module.exports = {
  app: {
    ver: 104,
    id: '112aba1ad4424e7891037028ef024645',
    name: 'foreworld.net',
    resHost: '127.0.0.1',
  },
  activemq: {
    host: process.env.ACTIVEMQ_HOST || '127.0.0.1',
    port: process.env.ACTIVEMQ_PORT || 12613,
    user: 'admin',
    password: process.env.ACTIVEMQ_PASS || 'admin',
  },
  mysql: {
    database: 'emag2',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 12306,
    user: 'root',
    password: process.env.MYSQL_PASS || 'password',
    connectionLimit: 50
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 12379,
    password: process.env.REDIS_PASS || '123456',
    database: 1
  }
};