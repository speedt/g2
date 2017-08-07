/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd = process.cwd();

const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');
const uuid = require('node-uuid');

const utils = require('speedt-utils').utils;

const redis = require('emag.db').redis;

const _ = require('underscore');

(() => {
  const numkeys = 5;
  const sha1 = 'e17e6be592cb2329e3bbeead122881f678741278';

  exports.search = function(server_id, channel_id, group_type, cb){

    if(!server_id)  return;
    if(!channel_id) return;
    if(!group_type) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, utils.replaceAll(uuid.v1(), '-', ''), group_type, (err, doc) => {
      if(err) return cb(err);
      cb(null, doc);
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1 = 'dcd26c256b539abb06537c870b7aa9edc8493870';

  exports.quit = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, doc) => {
      if(err) return cb(err);
      cb(null, doc);
    });
  };
})();

(() => {
  const numkeys = 2;
  const sha1 = '36dd2f395a42b46d0aeaeb4916038cec021a5252';

  /**
   * group_users_ready.lua
   */
  exports.readyUsers = function(group_id, cb){

    if(!group_id) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, group_id, (err, doc) => {
      if(err) return cb(err);
      cb(null, doc);
    });
  };
})();

(() => {
  const numkeys = 2;
  const sha1 = 'c47ce9507e3bd83983b15d788a53809aadc4fa69';

  /**
   * group_users.lua
   */
  exports.allUsers = function(group_id, cb){

    if(!group_id) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, group_id, (err, doc) => {
      if(err) return cb(err);
      cb(null, doc);
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1 = '8777f3896f54ebdbedb136f5b7befe7d6261c824';

  /**
   * group_users_channel.lua
   */
  exports.findUsersByChannel = function(server_id, channel_id, cb){

    if(!server_id) return;
    if(!channel_id) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, doc) => {
      if(err) return cb(err);
      cb(null, doc);
    });
  };
})();
