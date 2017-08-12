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

  var send_data = [data.channelId, JSON.stringify([conf.app.ver, 3002])];

  logger.debug('group search: %j', send_data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, send_data, (err, code) => {
    if(err) return logger.error('group search:', err);
  });
};

exports.quit = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('group quit empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.group.quit(data.serverId, data.channelId, function (err, doc){
    if(err) return logger.error('group quit:', err);
  });
};
