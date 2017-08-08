/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path  = require('path');
const cwd   = process.cwd();
const conf  = require(path.join(cwd, 'settings'));
const utils = require('speedt-utils').utils;
const redis = require('emag.db').redis;
const _     = require('underscore');

(() => {
  const numkeys = 2;
  const sha1    = '956476395e6c9afdd2758dad315497e85c81d6f8';

  /**
   * back_open.lua
   */
  exports.open = function(back_id, cb){
    redis.evalsha(sha1, numkeys, conf.redis.database, back_id, _.now(), cb);
  };
})();

(() => {
  const numkeys = 2;
  const sha1    = '8c2b13a39ffabf7ef27677a6b14805b1921162c6';

  /**
   * back_close.lua
   */
  exports.close = function(back_id, cb){
    redis.evalsha(sha1, numkeys, conf.redis.database, back_id, cb);
  };
})();

(() => {
  const numkeys = 1;
  const sha1    = '81c73e6160b8add8ec35d8fd589482ceca68c05e';

  /**
   * 获取全部后置机id
   *
   * back_list.lua
   *
   * @return
   */
  exports.findAll = function(cb){
    redis.evalsha(sha1, numkeys, conf.redis.database, cb);
  };
})();
