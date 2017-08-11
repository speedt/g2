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

  var _front_start, _front_stop;

  var _channel_open, _channel_close;

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

    if(_front_start) _front_start.unsubscribe();
    if(_front_stop)   _front_stop.unsubscribe();

    if(_channel_open)   _channel_open.unsubscribe();
    if(_channel_close) _channel_close.unsubscribe();

    if(_2001_chat_1v1)     _2001_chat_1v1.unsubscribe();
    if(_2003_chat_group) _2003_chat_group.unsubscribe();

    client.disconnect(() => {
      logger.info('amq client disconnect: %s', _.now());
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

      _front_start = client.subscribe('/queue/front.start', handle.front.start);
      _front_stop  = client.subscribe('/queue/front.stop',  handle.front.stop);

      _channel_open  = client.subscribe('/queue/channel.open',  handle.channel.open.bind(null, send));
      _channel_close = client.subscribe('/queue/channel.close', handle.channel.close);

      _2001_chat_1v1   = client.subscribe('/queue/qq.2001',   handle.chat.one_for_one.bind(null, send));

      cb(null, client);

    }, err => {
      logger.error('amq client:', err);
      if(!client) return cb(err);
      client.disconnect(cb.bind(null, err));
    });
  };

  getClient(err => {});
})();
