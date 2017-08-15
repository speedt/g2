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

/**
 *
 */
exports.open = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('channel open empty');

  var s = msg.body.split('::');

  var server_id  = s[0];
  var channel_id = s[1];

  var _data = [channel_id, JSON.stringify([conf.app.ver, 1, , _.now()])];

  send('/queue/back.send.v3.'+ server_id, { priority: 9 }, _data, (err, code) => {
    if(err) return logger.error('channel open:', err);

    biz.user.getByChannelId(server_id, channel_id)
    .then(biz.user.registerChannel.bind(null, server_id, channel_id))
    .then(user => {
      logger.info('user login: %j', {
        log_type: 1,
        user_id: user.id,
        create_time: _.now(),
      });
    })
    .catch(err => {
      logger.error('channel open:', err);
    });
  });
};

/**
 *
 */
exports.close = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('channel close empty');

  var s = msg.body.split('::');

  var data = {
    serverId: s[0],
    channelId: s[1],
    seqId: 0,
  };

  biz.user.logout(data.serverId, data.channelId).then(user => {

    logger.info('user logout: %j', {
      log_type: 2,
      user_id: user.id,
      create_time: _.now(),
    });

  }).catch(err => {
    logger.error('channel close:', err);
  });
};
