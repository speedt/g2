/*!
 * emag.handle
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const biz    = require('emag.biz');
const cfg    = require('emag.cfg');

const log4js = require('log4js');
const logger = log4js.getLogger('handle');

const _ = require('underscore');

const group = require('./group');

exports.open = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('channel open empty');

  var s = msg.body.split('::');

  var server_id  = s[0];
  var channel_id = s[1];

  biz.user.saveNewLoginBonus(server_id, channel_id, function (err, doc){
    if(err) return logger.error('channel open:', err);
    if(!_.isObject(doc)) return;

    try{ var extend_data = JSON.parse(doc.extend_data);
    }catch(ex){ return; }

    extend_data.wheel_of_fortune_cell  = doc.wheel_of_fortune_cell;
    extend_data.wheel_of_fortune_bonus = doc.wheel_of_fortune_bonus;

    var sb = {
      method:   1,
      seqId:    1,
      receiver: channel_id,
      data:     extend_data,
    };

    if(client) client.send('/queue/back.send.v2.'+ server_id, { priority: 9 }, JSON.stringify(sb));
  });
};

exports.close = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('channel close empty');

  var s = msg.body.split('::');

  var server_id  = s[0];
  var channel_id = s[1];

  group._quit(client, server_id, channel_id, 0, function (err){
    if(err) return logger.error('group quit:', err);
    logger.info('group quit: %j', s);

    biz.user.logout(server_id, channel_id, function (err, code){
      if(err) return logger.error('channel close:', err);
      logger.info('channel close: %j', s);
    });
  });
};

exports.money = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('channel money empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  if(!data.serverId)  return;
  if(!data.channelId) return;

  biz.user.updateUserPurchase(data.serverId, data.channelId, function (err, doc){

    data.method   = 1016;
    data.receiver = data.channelId;
    data.data     = doc;
    if(client) client.send('/queue/back.send.v2.'+ data.serverId, { priority: 9 }, JSON.stringify(data));
  });
};
