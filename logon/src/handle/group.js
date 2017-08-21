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

const logger = require('log4js').getLogger('handle.group');

const _ = require('underscore');

/**
 *
 */
exports.search = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('group search empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  try{ var group_info = JSON.parse(data.data);
  }catch(ex){ return; }

  biz.user.getByChannelId(data.serverId, data.channelId)
  .then(biz.group.search.bind(null, group_info))
  .then(group_users => {
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 3002, data.seqId, _.now(), group_users]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;

      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('group search:', err);
      });
    }
  })
  .catch(err => {
    if('string' !== typeof err) return logger.error('group search:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([conf.app.ver, 3002, data.seqId, _.now(), { err: { code: err } }]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('group search:', err);
    });
  });
};

/**
 *
 */
exports.quit = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('group quit empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.user.getByChannelId(data.serverId, data.channelId)
  .then(biz.group.quit)
  .then(group_users => {
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 3006, data.seqId, _.now(), group_users]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;

      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('group quit:', err);
      });
    }
  })
  .catch(err => {
    if('string' !== typeof err) return logger.error('group quit:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([conf.app.ver, 3006, data.seqId, _.now(), { err: { code: err } }]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('group quit:', err);
    });
  });
};

/**
 *
 */
exports.entry = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('group entry empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.group.entry(data.serverId, data.channelId, data.data)
  .then(group_users => {
    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([conf.app.ver, 3008, data.seqId, _.now(), group_users]));

    for(let i of group_users){
      if(!i.server_id || !i.channel_id) continue;

      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('group entry:', err);
      });
    }
  })
  .catch(err => {
    if('string' !== typeof err) return logger.error('group entry:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([conf.app.ver, 3008, data.seqId, _.now(), { err: { code: err } }]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('group entry:', err);
    });
  });
};
