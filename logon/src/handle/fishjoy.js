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

/**
 *
 */
function _ready_ready(client, server_id, channel_id, seq_id, err, doc){
  if(err) return logger.error('fishjoy ready:', err);

  if(_.isArray(doc)){

    var arr1 = doc[0];
    if(!arr1) return;

    var result = {
      timestamp: new Date().getTime(),
      method:    5006,
      seqId:     seq_id,
      data:      doc[1],
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
      return client.send('/queue/front.force.v2.'+ server_id, { priority: 9 }, channel_id);
    default: break;
  }
}

/**
 *
 */
function _ready_refresh(client, seq_id, err, doc){
  if(err) return logger.error('fishjoy refresh:', err);

  if(!_.isArray(doc)) return;

  var arr1 = doc[0];
  if(!arr1) return;

  var result = {
    timestamp: new Date().getTime(),
    method:    5008,
    seqId:     seq_id,
    data:      doc[1],
  };

  for(let i=0, j=arr1.length; i<j; i++){
    let s           = arr1[i];
    result.receiver = arr1[++i];

    if(!s)               continue;
    if(!result.receiver) continue;

    client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  }
}

/**
 *
 */
function _ready_scene(client, seq_id, err, doc){
  if(err) return logger.error('fishjoy scene:', err);

  if(!_.isArray(doc)) return;

  var arr1 = doc;

  var result = {
    timestamp: new Date().getTime(),
    method:    5010,
    seqId:     seq_id,
  };

  for(let i=0, j=arr1.length; i<j; i++){
    let s           = arr1[i];
    result.receiver = arr1[++i];

    if(!s)               continue;
    if(!result.receiver) continue;

    client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  }
}

/**
 *
 */
function _ready_unfreeze(client, seq_id, err, doc){
  if(err) return logger.error('fishjoy unfreeze:', err);

  if(!_.isArray(doc)) return;

  var arr1 = doc;

  var result = {
    timestamp: new Date().getTime(),
    method:    5016,
    seqId:     seq_id,
    data:      doc[1],
  };

  for(let i=0, j=arr1.length; i<j; i++){
    let s           = arr1[i];
    result.receiver = arr1[++i];

    if(!s)               continue;
    if(!result.receiver) continue;

    client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
  }
}

/**
 *
 */
exports.ready = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('fishjoy ready empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.fishjoy.ready(data.serverId, data.channelId,
       _ready_ready.bind(null, client, data.serverId, data.channelId, data.seqId),
     _ready_refresh.bind(null, client, data.seqId),
       _ready_scene.bind(null, client, data.seqId),
    _ready_unfreeze.bind(null, client, data.seqId));
};

/**
 *
 */
exports.switch = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('fishjoy switch empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  try{ var ss = JSON.parse(data.data);
  }catch(ex){ return; }

  biz.fishjoy.switch(data.serverId, data.channelId, ss.level, function (err, doc){
    if(err) return logger.error('fishjoy switch:', err);

    if(_.isArray(doc)){

      var arr1 = doc[0];
      if(!arr1) return;

      var result = {
        method: 5014,
        seqId:  data.seqId,
        data:   [doc[1], ss.style],
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
 */
exports.shot = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('fishjoy shot empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.fishjoy.shot(data.serverId, data.channelId, data.data, function (err, doc){
    if(err) return logger.error('fishjoy shot:', err);

    if(_.isArray(doc)){

      var arr1 = doc[0];
      if(!arr1) return;

      var result = {
        timestamp: new Date().getTime(),
        method:    5002,
        seqId:     data.seqId,
        data:      doc[1],
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
 */
exports.blast = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('fishjoy blast empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.fishjoy.blast(data.serverId, data.channelId, data.data, function (err, doc){
    if(err) return logger.error('fishjoy blast:', err);

    if(_.isArray(doc)){

      var arr1 = doc[0];
      if(!arr1) return;

      var result = {
        timestamp: new Date().getTime(),
        method:    5004,
        seqId:     data.seqId,
        data:      doc[1],
      };

      return ((function(){

        for(let i=0, j=arr1.length; i<j; i++){
          let s           = arr1[i];
          result.receiver = arr1[++i];

          if(!s)               continue;
          if(!result.receiver) continue;

          client.send('/queue/back.send.v2.'+ s, { priority: 9 }, JSON.stringify(result));
        }

        // notify all
        if(!(result.data[5])) return;

        biz.frontend.findAll(function (err, docs){
          if(err) return logger.error('frontend findAll:', err);
          if(!docs) return;
          if(0 === docs.length) return;

          var data = JSON.stringify({
            method:   1010,
            receiver: 'ALL',
            data:     result.data
          });

          for(let i of docs){
            client.send('/queue/back.send.v2.'+ i, { priority: 8 }, data);
          }
        });

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
 */
exports.tool = function(client, msg){
  if(!_.isString(msg.body)) return logger.error('fishjoy tool empty');

  try{ var data = JSON.parse(msg.body);
  }catch(ex){ return; }

  biz.fishjoy.tool(data.serverId, data.channelId, data.data, function (err, doc){
    if(err) return logger.error('fishjoy tool:', err);

    if(_.isArray(doc)){

      var arr1 = doc[0];
      if(!arr1) return;

      var result = {
        timestamp: new Date().getTime(),
        method:    5012,
        seqId:     data.seqId,
        data:      doc[1],
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
