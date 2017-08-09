/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const uuid  = require('node-uuid');
const _     = require('underscore');
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;


(() => {
  const numkeys = 1;
  const sha1    = '4231ee247f4f3f575df2afb81a1da997071366a8';

  /**
   * 获取全部前置机id
   *
   * front_list.lua
   *
   * @return
   */
  exports.findAll = function(cb){
    redis.evalsha(sha1, numkeys, 0, cb);
  };
})();

/**
 *
 * @return 可用的服务器
 */
exports.available = function(cb){
  cb(null, '68');
};