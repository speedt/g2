/*!
 * emag.lib
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path   = require('path');
const cwd    = process.cwd();
const conf   = require(path.join(cwd, 'settings'));
const Stomp  = require('stompjs');
const logger = require('log4js').getLogger('lib.amq');

const activemq = conf.activemq;

(() => {
  var client = null;

  function unsubscribe(){
    if(!client) return;

    client.disconnect(() => {
      logger.info('amq client disconnect: %s', _.now());
    });
  }

  exports.getClient = function(cb){
    if(client) return cb(null, client);

    client = Stomp.overTCP(activemq.host, activemq.port);
    client.heartbeat.outgoing = 20000;
    // client will send heartbeats every 20000ms
    client.heartbeat.incoming = 10000;

    process.on('uncaughtException', err => {
      logger.error('uncaughtException: %j', err);
      unsubscribe();
    });

    process.on('exit', () => {
      unsubscribe();
    });

    client.connect({
      login:    activemq.user,
      passcode: activemq.password,
    }, function(){
      logger.debug('amq client: OK');
      cb(null, client);
    }, function (err){
      logger.error('amq client: %j', err);
      unsubscribe();
      cb(err);
    });

  };
})();

exports.sendReq = function(dest, params, data, cb){
  this.getClient(function (err, client){
    if(err) return cb(err);
    try{
      client.send(dest, params, data);
      cb(null, 'OK');
    }catch(ex){ cb(ex); }
  });
};
