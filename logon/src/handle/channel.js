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

const logger = require('log4js').getLogger('handle.channel');

const _ = require('underscore');

(() => {
  function step1(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.registerChannel(server_id, channel_id, function (err, code, user){
        if(err) return reject(err);
        if(code) return reject(code);
        resolve(user.id);
      });
    });
  }

  function step2(user_id){
    return new Promise((resolve, reject) => {

      logger.info('user login: %j', {
        log_type: 1,
        user_id: user_id,
        create_time: _.now(),
      });

      resolve();
    });
  }

  exports.open = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('channel open empty');

    var s = msg.body.split('::');

    var server_id  = s[0];
    var channel_id = s[1];

    var send_data = [channel_id, JSON.stringify([conf.app.ver, 1, , _.now()])];

    send('/queue/back.send.v3.'+ server_id, { priority: 9 }, send_data, (err, code) => {
      if(err) return logger.error('channel open:', err);

      step1.call(null, server_id, channel_id).then(user_id => {
        return step2.call(null, user_id);
      }).catch(err => {
        logger.error('channel open:', err);
      });

    });
  };
})();

exports.close = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('channel close empty');

  var s = msg.body.split('::');

  var server_id  = s[0];
  var channel_id = s[1];

  biz.user.logout(server_id, channel_id, function (err, code){
    if(err) return logger.error('channel close:', err);
    logger.info('channel close: %j', s);
  });
};
