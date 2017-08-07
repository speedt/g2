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

const md5 = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');

const _ = require('underscore');

(() => {
  var sql = 'SELECT b.user_name, a.* FROM (SELECT * FROM s_user_bonus_login WHERE user_id=?) a LEFT JOIN s_user b ON (a.user_id=b.id) WHERE b.id IS NOT NULL ORDER BY a.create_time DESC';

  /**
   * 用户登陆奖励记录
   */
  exports.findLoginByUserId = function(user_id, cb){
    mysql.query(sql, [user_id], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();
