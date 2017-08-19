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
const cfg    = require('emag.cfg');

const logger = require('log4js').getLogger('handle.pushCake');

const _ = require('underscore');

exports.ready = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('pushCake ready empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.user.getByChannelId(data.serverId, data.channelId)
  .then(biz.pushCake.ready)
  .then(group_users => {
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 5006, data.seqId, _.now(), group_users]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;

      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('pushCake ready:', err);
      });
    }
  })
  .catch(err => {
    if('string' !== typeof err) return logger.error('pushCake ready:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([conf.app.ver, 5006, data.seqId, _.now(), { err: { code: err } }]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('pushCake ready:', err);
    });
  });
};
