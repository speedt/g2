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

const logger = require('log4js').getLogger('handle');

const _ = require('underscore');

exports.ready = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('pushCake ready empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  var _data = {
    users_info: ['张三', '李四'],
    game_info: {
      status: '玩家准备中/选庄',  // 游戏状态
    }
  };

  _data.err = {
    code: 101,
    msg: '失败描述'
  };

  var send_data = [data.channelId, JSON.stringify([conf.app.ver, 5006, null, _.now(), JSON.stringify(_data)])];

  logger.debug('pushCake ready: %j', send_data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, send_data, (err, code) => {
    if(err) return logger.error('pushCake ready:', err);
  });
};
