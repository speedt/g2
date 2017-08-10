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
const _      = require('underscore');

const logger = require('log4js').getLogger('handle');

/**
 *
 */
exports.one_for_one = function(send, msg){
  if(!_.isString(msg.body)) return logger.error('chat one_for_one empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  if(!data.serverId)  return;
  if(!data.channelId) return;

  var send_data = [data.channelId, JSON.stringify([conf.app.ver, 2002, , _.now(), data.data])];

  logger.debug('chat one_for_one: %j', send_data);

  send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, send_data, (err, code) => {
    if(err) return logger.error('chat one_for_one:', err);
  });
};

/**
 *
 */
exports.one_for_group = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('chat one_for_group empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  if(!data.serverId)  return;
  if(!data.channelId) return;

  var send_msg = filtering(data.data);
  if(!send_msg)       return;

  biz.group.findUsersByChannel(data.serverId, data.channelId, function (err, doc){
    if(err) return logger.error('group findUsersByChannel:', err);

    if(_.isArray(doc)){

      var arr1 = doc[0];
      if(!arr1) return;

      var result = {
        method: 2004,
        seqId:  data.seqId,
        data:   [doc[1], send_msg],
      };

      return ((function(){

        for(let i=0, j=arr1.length; i<j; i++){
          let s           = arr1[i];
          result.receiver = arr1[++i];

          if(!s)               continue;
          if(!result.receiver) continue;

          client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
        }
      })());
    }

    switch(doc){
      case 'invalid_user_id':
        return client.send('/queue/front.force.v2.'+ data.serverId, { priority: 9 }, data.channelId);
    }
  });
};

/**
 *
 * 信息过滤
 *
 * @return
 */
function filtering(msg){
  return msg;
}
