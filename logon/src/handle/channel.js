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

exports.open = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('channel open empty');

  var s = msg.body.split('::');

  var data = {
    serverId: s[0],
    channelId: s[1],
  };

  biz.user.registerChannel(data.serverId, data.channelId)
  .then(() => {
    var _data = [data.channelId, JSON.stringify([conf.app.ver, 1, , _.now()])];
    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('channel open:', err);
    });
  })
  .catch(err => {
    logger.error('channel open:', err);
  });
};

exports.close = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('channel close empty');

  var s = msg.body.split('::');

  var data = {
    serverId: s[0],
    channelId: s[1],
  };

  biz.user.logout(data.serverId, data.channelId)
  .then(docs => {
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 3006, data.seqId, _.now(), docs]));

    for(let i of docs){
      if(!i.server_id || !i.channel_id) continue;

      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('channel close:', err);
      });
    }
  })
  .catch(err => {
    if('string' !== typeof err) return logger.error('channel close:', err);

    switch(err){
      case 'invalid_user_id': return logger.error('channel close:', err);
      default: return logger.debug('channel close:', err);
    }
  });
};
