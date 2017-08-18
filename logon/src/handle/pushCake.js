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
