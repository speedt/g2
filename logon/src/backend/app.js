/*!
 * emag.backend
 * Copyright(c) 2017 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path   = require('path');
const cwd    = process.cwd();
const _      = require('underscore');
const conf   = require('./settings');
const cfg    = require('emag.cfg');
const biz    = require('emag.biz');
const handle = require('emag.handle');
const Stomp  = require('stompjs');

const activemq = conf.activemq;

const log4js = require('log4js');

log4js.configure({
  appenders: {
    app: {
      type: 'dateFile',
      filename: path.join(cwd, 'logs', 'app'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['app', 'console'],
      level: 'debug'
    }
  }
});

const logger = log4js.getLogger('app');
// logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info ('Cheese is Gouda.');
// logger.warn ('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');

process.on('uncaughtException', err => {
  logger.error('uncaughtException:', err);
});

function exit(){
  biz.backend.close(conf.app.id, (err, code) => {
    if(err) return logger.error('backend %j close:', conf.app.id, err);
    logger.info('backend %j close: %j', conf.app.id, code);
    process.exit(0);
  });
}

process.on('SIGINT', exit);
process.on('SIGTERM', exit);
process.on('exit', exit);

biz.backend.open(conf.app.id, (err, code) => {
  if(err) return logger.error('backend %j open:', conf.app.id, err);
  logger.info('backend %j open: %j', conf.app.id, code);
});

(() => {
  var client = null;

  var _2001_chat_1v1, _2003_chat_group;

  function send(dest, params, data, cb){
    getClient((err, client) => {
      if(err) return cb(err);
      try{
        client.send(dest, params || {}, JSON.stringify(data));
        cb(null, 'OK');
      }catch(ex){ cb(ex); }
    });
  };

  function unsubscribe(){
    if(!client) return;

    if(_2001_chat_1v1)     _2001_chat_1v1.unsubscribe();
    if(_2003_chat_group) _2003_chat_group.unsubscribe();

    client.disconnect(() => {
      logger.info('amq client disconnect: %s', _.now());
      process.exit(0);
    });
  }

  process.on('SIGINT', unsubscribe);
  process.on('SIGTERM', unsubscribe);
  process.on('exit', unsubscribe);

  function getClient(cb){
    if(client) return cb(null, client);

    client = Stomp.overTCP(activemq.host, activemq.port);
    client.heartbeat.outgoing = 20000;
    client.heartbeat.incoming = 10000;

    client.connect({
      login:    activemq.user,
      passcode: activemq.password,
    }, () => {
      logger.debug('amq client: OK');

      _2001_chat_1v1   = client.subscribe('/queue/qq.2001',   handle.chat.one_for_one.bind(null, send));

      cb(null, client);

    }, err => {
      logger.error('amq client:', err);
      cb(err);
    });
  };

  getClient(err => {});
})();
