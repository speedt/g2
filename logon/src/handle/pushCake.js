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

const logger = require('log4js').getLogger('handle.pushCake');

const _ = require('underscore');

(() => {
  function p1(send, data, result){
    if(0 === result.length) return;

    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([5006, data.seqId, _.now(), result[1]]));

    for(let i of result[0]){
      if(!i.server_id || !i.channel_id) continue;
      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('pushCake ready:', err);
      });
    }
  }

  function p2(send, data, err){
    if('string' !== typeof err) return logger.error('pushCake ready:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([5006, data.seqId, _.now(), , err]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('pushCake ready:', err);
    });
  }

  /**
   *
   */
  exports.ready = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('pushCake ready empty');

    try{ var data = JSON.parse(msg.body);
    }catch(ex){ return; }

    biz.pushCake.ready(data.serverId, data.channelId, next.bind(null, send, data))
    .then(p1.bind(null, send, data))
    .catch(p2.bind(null, send, data));
  };

  /**
   *
   */
  function next(send, data, err, result){
    if(err) return p3(send, data, err);
    p4(send, data, result);
  }

  function p3(send, data, err){
    logger.error('pushCake ready next:', err);
  }

  function p4(send, data, result){
    console.log(result);
  }
})();

(() => {
  function p1(send, data, result){
    if(0 === result.length) return;

    var _data = [];
    _data.push(null);
    _data.push(JSON.stringify([5012, data.seqId, _.now(), result[1]]));

    for(let i of result[0]){
      if(!i.server_id || !i.channel_id) continue;
      _data.splice(0, 1, i.channel_id);

      send('/queue/back.send.v3.'+ i.server_id, { priority: 9 }, _data, (err, code) => {
        if(err) return logger.error('pushCake craps:', err);
      });
    }
  }

  function p2(send, data, err){
    if('string' !== typeof err) return logger.error('pushCake craps:', err);

    var _data = [];
    _data.push(data.channelId);
    _data.push(JSON.stringify([5012, data.seqId, _.now(), , err]));

    send('/queue/back.send.v3.'+ data.serverId, { priority: 9 }, _data, (err, code) => {
      if(err) return logger.error('pushCake craps:', err);
    });
  }

  /**
   *
   */
  exports.craps = function(send, msg){
    if(!_.isString(msg.body)) return logger.error('pushCake craps empty');

    try{ var data = JSON.parse(msg.body);
    }catch(ex){ return; }

    biz.pushCake.craps(data.serverId, data.channelId, next.bind(null, send, data))
    .then(p1.bind(null, send, data))
    .catch(p2.bind(null, send, data));
  };

  /**
   *
   */
  function next(send, data, err, result){
    if(err) return p3(send, data, err);
    p4(send, data, result);
  }

  function p3(send, data, err){
    logger.error('pushCake craps next:', err);
  }

  function p4(send, data, result){
    console.log(result);
  }
})();
