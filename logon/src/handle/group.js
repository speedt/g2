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

exports.search = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('group search empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  var _data = {
    group_info: {
      id: _.random(100000, 999999),
      name: '房间名',
      visitor_count: 6,  // n个钓鱼人
    },
    users_info: [{
      id: '张三',
      seat: 1,
    }],
    game_info: {
      status: 1,  // 游戏状态
      round_count: 4,  // n圈
      group_fund: 1000,  // 组局基金
    }
  };

  _data.err = {
    code: 101,
    msg: '失败描述'
  };

  var send_data = [data.channelId, JSON.stringify([conf.app.ver, 3002, null, _.now(), JSON.stringify(_data)])];

  logger.debug('group search: %j', send_data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, send_data, (err, code) => {
    if(err) return logger.error('group search:', err);
  });
};

exports.quit = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('group quit empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  var _data = {
    user_id: '张三',
    game_info: {
      status: 1,  // 游戏状态
    }
  };

  _data.err = {
    code: 101,
    msg: '失败描述'
  };

  var send_data = [data.channelId, JSON.stringify([conf.app.ver, 3006, null, _.now(), JSON.stringify(_data)])];

  logger.debug('group quit: %j', send_data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, send_data, (err, code) => {
    if(err) return logger.error('group quit:', err);
  });
};

(() => {

  function step1(serverId, channelId){

    return new Promise((resolve, reject) => {

      biz.user.getByChannelId(serverId, channelId, (err, code, doc) => {
        if(err) return reject(err);
        if(code) return reject(code);
        resolve(doc);
      });
    });
  }

  function step2(user_id, group_id){

    return new Promise((resolve, reject) => {

      biz.group.entry(user_id, group_id, (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
      });
    });
  }

  exports.entry = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('group entry empty');

    try{ var data = JSON.parse(msg.body);
    }catch(ex){ return; }

    step1.call(null, data.serverId, data.channelId).then(user => {
      return step2.call(null, user.id, data.data);
    }).then(docs => {
      console.log(docs);
    }).catch(err => {
      logger.error('group entry:', err);
    });
  };

})();
