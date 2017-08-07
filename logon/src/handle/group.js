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

exports.search = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('group search empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  _quit(client, data.serverId, data.channelId, data.seqId, function (err){
    if(err) return logger.error('group quit:', err);
    logger.info('group quit: success');

    biz.group.search(data.serverId, data.channelId, data.data, function (err, doc){
      if(err) return logger.error('group search:', err);

      if(_.isArray(doc)){

        var arr1 = doc[0];
        if(!arr1) return;

        var result = {
          method: 3002,
          seqId:  data.seqId,
          data:   doc[1],
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
        case 'invalid_group_type':
          return client.send('/queue/front.force.v2.'+ data.serverId, { priority: 9 }, data.channelId);
      }
    });
  });
};

exports.quit = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('group quit empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  _quit(client, data.serverId, data.channelId, data.seqId, function (err){
    if(err) return logger.error('group quit:', err);
    logger.info('group quit: success');
  });
};

var _quit = exports._quit = function(client, server_id, channel_id, seq_id, cb){
  if(!client)     return;
  if(!server_id)  return;
  if(!channel_id) return;

  biz.group.quit(server_id, channel_id, function (err, doc){
    if(err) return cb(err);

    if(_.isArray(doc)){

      var arr1 = doc[0];
      if(!arr1) return;

      var result = {
        method: 3006,
        seqId:  seq_id,
        data:   doc[1],
      };

      for(let i=0, j=arr1.length; i<j; i++){
        let s           = arr1[i];
        result.receiver = arr1[++i];

        if(!s)               continue;
        if(!result.receiver) continue;

        client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
      }

      return cb();
    }

    switch(doc){
      case 'OK': return cb();
      case 'invalid_user_id':
        return client.send('/queue/front.force.v2.'+ server_id, { priority: 9 }, channel_id);
    }
  });
};
