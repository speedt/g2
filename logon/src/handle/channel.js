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

const log4js = require('log4js');
const logger = log4js.getLogger('handle');

const _ = require('underscore');

const group = require('./group');

exports.open = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('channel open empty');

  var s = msg.body.split('::');

  var server_id  = s[0];
  var channel_id = s[1];

  var send_data = [channel_id, JSON.stringify([conf.app.ver, 1, , _.now()])];

  send('/queue/back.send.v3.'+ server_id, { priority: 9 }, send_data, (err, code) => {
    if(err) return logger.error('channel open:', err);
  });
};

exports.close = function(msg){
  if(!_.isString(msg.body)) return logger.error('channel close empty');

  var s = msg.body.split('::');

  var server_id  = s[0];
  var channel_id = s[1];

  biz.user.logout(server_id, channel_id, function (err, code){
    if(err) return logger.error('channel close:', err);
    logger.info('channel close: %j', s);
  });
};
