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

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const _ = require('underscore');

(() => {
  const numkeys = 2;
  const sha1 = 'a1b59e7495ba86686076d5bb618264e80c44709d';

  /**
   * front_open.lua
   */
  exports.open = function(front_id, cb){

    if(!front_id) return;

    redis.evalsha(sha1, numkeys, 0, front_id, _.now(), (err, code) => {
      if(err) return cb(err);
      cb(null, code);
    });
  };
})();

(() => {
  const numkeys = 2;
  const sha1 = '7f26497b91e6746a28165dfc733f1beeb9247f97';

  /**
   * front_close.lua
   */
  exports.close = function(front_id, cb){

    if(!front_id) return;

    redis.evalsha(sha1, numkeys, 0, front_id, (err, code) => {
      if(err) return cb(err);
      cb(null, code);
    });
  };
})();

(() => {
  const numkeys = 1;
  const sha1 = '4231ee247f4f3f575df2afb81a1da997071366a8';

  /**
   * 获取全部前置机id
   *
   * front_list.lua
   *
   * @return
   */
  exports.findAll = function(cb){

    redis.evalsha(sha1, numkeys, 0, (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();
