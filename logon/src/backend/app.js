/*!
 * emag.backend
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd = process.cwd();

const _ = require('underscore');

const conf = require('./settings');

const biz    = require('emag.biz');
const cfg    = require('emag.cfg');
const handle = require('emag.handle');

const redis = require('emag.db').redis;

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
// logger.info('Cheese is Gouda.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');

process.on('uncaughtException', err => {
  logger.error('uncaughtException:', err);
});

process.on('exit', () => {

  biz.backend.close(conf.app.id, (err, code) => {
    if(err) return logger.error('backend %j close:', conf.app.id, err);
    logger.info('backend %j close: %j', conf.app.id, code);

    if(redis) redis.quit();
  });
});

biz.backend.open(conf.app.id, (err, code) => {
  if(err) return logger.error('backend %j open:', conf.app.id, err);
  logger.info('backend %j open: %j', conf.app.id, code);
});

biz.cfg.init(function (err, res){
  if(err) return process.exit(1);
  logger.info('cfg init: %s', res);
});

// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------

(function(){

  var activemq = conf.activemq;

  var Stomp = require('stompjs');
  var client = Stomp.overTCP(activemq.host, activemq.port);

  client.heartbeat.outgoing = 20000;
  // client will send heartbeats every 20000ms
  client.heartbeat.incoming = 10000;

  function unRegisterQueue(){
    // todo
  }

  function registerQueue(){
    // todo
  }

  var onCb = function(frame){
    registerQueue();

    _front_start = client.subscribe('/queue/front.start', handle.front.start);
    _front_stop  = client.subscribe('/queue/front.stop',  handle.front.stop);

    _channel_open  = client.subscribe('/queue/channel.open',   handle.channel.open.bind(null, client));
    _channel_close = client.subscribe('/queue/channel.close', handle.channel.close.bind(null, client));
    _channel_money   = client.subscribe('/queue/qq.1015',     handle.channel.money.bind(null, client));

    _2001_chat_1v1   = client.subscribe('/queue/qq.2001',   handle.chat.one_for_one.bind(null, client));
    _2003_chat_group = client.subscribe('/queue/qq.2003', handle.chat.one_for_group.bind(null, client));

    _3001_group_search = client.subscribe('/queue/qq.3001', handle.group.search.bind(null, client));
    _3005_group_quit   = client.subscribe('/queue/qq.3005',   handle.group.quit.bind(null, client));

    _5001_fishjoy_shot   = client.subscribe('/queue/qq.5001',                handle.fishjoy.shot.bind(null, client));
    _5003_fishjoy_blast  = client.subscribe('/queue/qq.5003.'+ conf.app.id, handle.fishjoy.blast.bind(null, client));
    _5005_fishjoy_ready  = client.subscribe('/queue/qq.5005',               handle.fishjoy.ready.bind(null, client));
    _5011_fishjoy_tool   = client.subscribe('/queue/qq.5011.'+ conf.app.id,  handle.fishjoy.tool.bind(null, client));
    _5013_fishjoy_switch = client.subscribe('/queue/qq.5013',              handle.fishjoy.switch.bind(null, client));
  };

  function _unsubscribe(){
    unRegisterQueue();

    if(_front_start) _front_start.unsubscribe();
    if(_front_stop)   _front_stop.unsubscribe();

    if(_channel_open)   _channel_open.unsubscribe();
    if(_channel_close) _channel_close.unsubscribe();
    if(_channel_money) _channel_money.unsubscribe();

    if(_2001_chat_1v1)     _2001_chat_1v1.unsubscribe();
    if(_2003_chat_group) _2003_chat_group.unsubscribe();

    if(_3001_group_search) _3001_group_search.unsubscribe();
    if(_3005_group_quit)     _3005_group_quit.unsubscribe();

    if(_5001_fishjoy_shot)     _5001_fishjoy_shot.unsubscribe();
    if(_5013_fishjoy_switch) _5013_fishjoy_switch.unsubscribe();
    if(_5003_fishjoy_blast)   _5003_fishjoy_blast.unsubscribe();
    if(_5005_fishjoy_ready)   _5005_fishjoy_ready.unsubscribe();
    if(_5011_fishjoy_tool)     _5011_fishjoy_tool.unsubscribe();

    if(!client) return;

    client.disconnect(() => {
      logger.info('stompjs client disconnect: %s', _.now());
    });
  }

  var onErr = function(err){
    _unsubscribe();
    logger.error('stompjs client:', err);
  };

  process.on('uncaughtException', err => {
    _unsubscribe();
  });

  process.on('exit', () => {
    _unsubscribe();
  });

  const headers = {
    login: activemq.user,
    passcode: activemq.password,
  };

  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  var _front_start, _front_stop;

  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  var _channel_open, _channel_close, _channel_money;

  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  var _2001_chat_1v1, _2003_chat_group;

  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  var _3001_group_search, _3005_group_quit;

  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  var _5001_fishjoy_shot, _5013_fishjoy_switch;
  var _5003_fishjoy_blast, _5005_fishjoy_ready, _5011_fishjoy_tool;

  // var on_5001_fishjoy_shot = function(msg){
  //   if(!msg.body) return logger.error('fishjoy shot empty');

  //   var data = JSON.parse(msg.body);

  //   biz.fishjoy.shot(data.serverId, data.channelId, data.data, function (err, doc){
  //     if(err) return logger.error('fishjoy shot:', err);

  //     if(_.isArray(doc)){

  //       var result = {
  //         method: 5002,
  //         seqId: data.seqId,
  //         data: doc[1],
  //       };

  //       return ((function(){

  //         var arr = doc[0];

  //         for(let i=0, j=arr.length; i<j; i++){
  //           var s = arr[i];
  //           result.receiver = arr[++i];
  //           if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //         }

  //       })());
  //     }

  //     switch(doc){
  //       case 'invalid_user_id':
  //         return client.send('/queue/front.force.v2.'+ server_id, { priority: 9 }, channel_id);
  //       case 'invalid_bullet_level':
  //       case 'invalid_group_id':
  //       case 'invalid_group_pos_id':
  //       case 'invalid_raise_hand':
  //       case 'invalid_user_score':
  //       default: return;
  //     }

  //   });
  // };

  // var on_5003_fishjoy_blast = function(msg){
  //   if(!msg.body) return logger.error('fishjoy blast empty');

  //   var data = JSON.parse(msg.body);

  //   biz.fishjoy.blast(data.serverId, data.channelId, data.data, function (err, doc){
  //     if(err) return logger.error('fishjoy blast:', err);

  //     if(_.isArray(doc)){

  //       var result = {
  //         method: 5004,
  //         seqId: data.seqId,
  //         data: doc[1],
  //       };

  //       return ((function(){

  //         var arr = doc[0];

  //         for(let i=0, j=arr.length; i<j; i++){
  //           var s = arr[i];
  //           result.receiver = arr[++i];
  //           if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //         }

  //       })());
  //     }

  //     switch(doc){
  //       case 'invalid_user_id':
  //         return client.send('/queue/front.force.v2.'+ data.serverId, { priority: 9 }, data.channelId);
  //       case 'invalid_bullet_id':
  //       default: return;
  //     }

  //   });
  // };

  // var _on_5005_fishjoy_ready_ready = function(server_id, channel_id, seq_id, err, doc){
  //   if(err) return logger.error('fishjoy ready ready:', err);

  //   if(_.isArray(doc)){

  //     var result = {
  //       method: 5006,
  //       seqId: seq_id,
  //       data: doc[1]
  //     };

  //     return ((function(){

  //       var arr = doc[0];

  //       for(let i=0, j=arr.length; i<j; i++){
  //         let s = arr[i];
  //         result.receiver = arr[++i];
  //         if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //       }

  //     })());
  //   }

  //   switch(doc){
  //     case 'invalid_user_id':
  //       return client.send('/queue/front.force.v2.'+ server_id, { priority: 9 }, channel_id);
  //     case 'invalid_group_id':
  //     case 'invalid_group_pos_id':
  //     case 'already_raise_hand': return;
  //   }

  // };

  // var _on_5005_fishjoy_ready_refresh = function(seq_id, err, doc){
  //   if(err) return logger.error('fishjoy ready refresh:', err);

  //   if(!_.isArray(doc)) return;

  //   var result = {
  //     timestamp: new Date().getTime(),
  //     method: 5008,
  //     seqId: seq_id,
  //     data: doc[1],
  //   };

  //   var arr = doc[0];

  //   for(let i=0, j=arr.length; i<j; i++){
  //     let s = arr[i];
  //     result.receiver = arr[++i];
  //     if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //   }
  // };

  // var _on_5005_fishjoy_ready_scene = function(seq_id, err, doc){
  //   if(err) return logger.error('fishjoy ready scene:', err);

  //   if(!_.isArray(doc)) return;

  //   var result = {
  //     timestamp: new Date().getTime(),
  //     method: 5010,
  //     seqId: seq_id,
  //   };

  //   var arr = doc;

  //   for(let i=0, j=arr.length; i<j; i++){
  //     let s = arr[i];
  //     result.receiver = arr[++i];
  //     if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //   }
  // };

  // var _on_5005_fishjoy_ready_unfreeze = function(seq_id, err, doc){
  //   if(err) return logger.error('fishjoy ready unfreeze:', err);

  //   if(!_.isArray(doc)) return;

  //   var result = {
  //     timestamp: new Date().getTime(),
  //     method: 5016,
  //     seqId: seq_id,
  //   };

  //   var arr = doc;

  //   for(let i=0, j=arr.length; i<j; i++){
  //     let s = arr[i];
  //     result.receiver = arr[++i];
  //     if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //   }
  // };

  // var on_5005_fishjoy_ready = function(msg){
  //   if(!msg.body) return logger.error('fishjoy ready empty');

  //   var data = JSON.parse(msg.body);

  //   biz.fishjoy.ready(data.serverId, data.channelId,
  //     _on_5005_fishjoy_ready_ready.bind(null, data.serverId, data.channelId, data.seqId),
  //     _on_5005_fishjoy_ready_refresh.bind(null, data.seqId),
  //     _on_5005_fishjoy_ready_scene.bind(null, data.seqId),
  //     _on_5005_fishjoy_ready_unfreeze.bind(null, data.seqId));
  // };

  // var on_5013_fishjoy_switch = function(msg){
  //   if(!msg.body) return logger.error('fishjoy switch empty');

  //   var data = JSON.parse(msg.body);

  //   biz.fishjoy.switch(data.serverId, data.channelId, data.data, function (err, doc){
  //     if(err) return logger.error('fishjoy switch:', err);

  //     if(_.isArray(doc)){

  //       var result = {
  //         method: 5014,
  //         seqId: data.seqId,
  //         data: doc[1],
  //       };

  //       return ((function(){

  //         var arr = doc[0];

  //         for(let i=0, j=arr.length; i<j; i++){
  //           var s = arr[i];
  //           result.receiver = arr[++i];
  //           if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //         }

  //       })());
  //     }

  //     switch(doc){
  //       case 'invalid_user_id':
  //         return client.send('/queue/front.force.v2.'+ server_id, { priority: 9 }, channel_id);
  //       case 'invalid_bullet_level':
  //       default: return;
  //     }

  //   });
  // };

  // var on_5011_fishjoy_tool = function(msg){
  //   if(!msg.body) return logger.error('fishjoy tool empty');

  //   var data = JSON.parse(msg.body);

  //   biz.fishjoy.tool(data.serverId, data.channelId, data.data, function (err, doc){
  //     if(err) return logger.error('fishjoy tool:', err);

  //     if(_.isArray(doc)){

  //       var result = {
  //         method: 5012,
  //         seqId: data.seqId,
  //         data: doc[1],
  //       };

  //       return ((function(){

  //         var arr = doc[0];

  //         for(let i=0, j=arr.length; i<j; i++){
  //           var s = arr[i];
  //           result.receiver = arr[++i];
  //           if(s) client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  //         }

  //       })());
  //     }

  //     switch(doc){
  //       case 'invalid_user_id':
  //         return client.send('/queue/front.force.v2.'+ server_id, { priority: 9 }, channel_id);
  //       case 'invalid_group_id':
  //       default: return;
  //     }

  //   });
  // };

  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------------------

  client.connect(headers, onCb, onErr);
})();