/*!
 * emag.handle
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const biz    = require('emag.biz');
const cfg    = require('emag.cfg');
const handle = require('emag.handle');

const logger = require('log4js').getLogger('handle.channel');

const _ = require('underscore');

(() => {
  function p1(send, data, group_users){
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 3008, data.seqId, _.now(), group_users]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;
      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('channel open:', err);
      });
    }

    return new Promise((resolve, reject) => resolve());
  }

  function p2(send, data, err){
    if('string' !== typeof err) return logger.error('channel open:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([conf.app.ver, 3008, data.seqId, _.now(), { err: { code: err } }]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('channel open:', err);
    });
  }

  function p3(send, data){
    var _data = [data.channelId, JSON.stringify([conf.app.ver, 1, , _.now()])];
    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('channel open:', err);
    });

    return new Promise((resolve, reject) => resolve());
  }

  /**
   *
   */
  exports.open = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('channel open empty');

    var s = msg.body.split('::');
    var data = { serverId: s[0], channelId: s[1] };

    biz.user.registerChannel(data.serverId, data.channelId)
    .then(p1.bind(null, send, data))
    .then(p3.bind(null, send, data))
    .catch(p2.bind(null, send, data));
  };
})();

(() => {
  function p1(send, data, group_users){
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 3006, data.seqId, _.now(), group_users]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;
      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('channel close:', err);
      });
    }
  }

  function p2(err){
    if('string' !== typeof err) return logger.error('channel close:', err);
    switch(err){
      case 'invalid_user_id': return logger.error('channel close:', err);
      default: logger.debug('channel close:', err);
    }
  }

  /**
   *
   */
  exports.close = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('channel close empty');

    var s = msg.body.split('::');
    var data = { serverId: s[0], channelId: s[1] };

    biz.user.logout(data.serverId, data.channelId)
    .then(p1.bind(null, send, data))
    .catch(p2);
  };
})();
