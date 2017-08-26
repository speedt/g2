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

const logger = require('log4js').getLogger('handle');

const _  = require('underscore');
_.str    = require('underscore.string');
_.mixin(_.str.exports());

/**
 *
 */
exports.one_for_one = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('chat one_for_one empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  var _data = [data.channelId, JSON.stringify([2002, , _.now(), data.data])];

  logger.debug('chat one_for_one: %j', _data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
    if(err) return logger.error('chat one_for_one:', err);
  });
};

(() => {
  function formVali(data, user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('通道不存在');
      if(!_.isNumber(user.group_user_seat)) return reject('不在任何群组');
      if(!user.group_id) return reject('不在任何群组');

      data.user_id  = user.id;
      resolve(user.group_id);
    });
  }

  function p1(send, data, group_users){
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([2004, data.seqId, _.now(), [data.user_id, data.data]]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;
      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('chat one_for_group:', err);
      });
    }
  }

  function p2(send, data, err){
    if('string' !== typeof err) return logger.error('chat one_for_group:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([2004, data.seqId, _.now(), , err]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('chat one_for_group:', err);
    });
  }

  /**
   *
   */
  exports.one_for_group = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('chat one_for_group empty');

    try{ var data = JSON.parse(msg.body);
    }catch(ex){ return; }

    data.data = filter(data.data);
    if(!data.data) return;

    biz.user.getByChannelId(data.serverId, data.channelId)
    .then(formVali.bind(null, data))
    .then(biz.group_user.findAllByGroupId)
    .then(p1.bind(null, send, data))
    .catch(p2.bind(null, send, data));
  };
})();

/**
 *
 * 信息过滤
 *
 * @return
 */
function filter(msg){
  if(!_.isString(msg)) return;
  return _.trim(msg);
}
