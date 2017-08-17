/*!
 * emag.handle
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path  = require('path');
const cwd   = process.cwd();
const conf  = require(path.join(cwd, 'settings'));

const biz    = require('emag.biz');
const _      = require('underscore');

const logger = require('log4js').getLogger('handle');

/**
 *
 */
exports.one_for_one = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('chat one_for_one empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  var _data = [data.channelId, JSON.stringify([conf.app.ver, 2002, , _.now(), data.data])];

  logger.debug('chat one_for_one: %j', _data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
    if(err) return logger.error('chat one_for_one:', err);
  });
};

/**
 *
 */
exports.one_for_group = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('chat one_for_group empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  var send_msg = filter(data.data);
  if(!send_msg) return;

  biz.user.getByChannelId(data.serverId, data.channelId)
  .then(user => {
    return new Promise((resolve, reject) => {
      resolve(user.id);
    });
  })
  .then(biz.group_user.findAllByUserId)
  .then(group_users => {

    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 2004, data.seqId, data.timestamp, send_msg]));

    for(let i of group_users){
      if(!i.server_id) continue;
      if(!i.channel_id) continue;

      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('chat one_for_group:', err);
      });
    }

  })
  .catch(err => {
    if('string' !== typeof err) return logger.error('chat one_for_group:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([conf.app.ver, 2004, data.seqId, _.now(), { err: { code: err } }]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('chat one_for_group:', err);
    });
  });
};

/**
 *
 * 信息过滤
 *
 * @return
 */
function filter(msg){
  return msg;
}
