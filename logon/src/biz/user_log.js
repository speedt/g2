/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');

const utils = require('speedt-utils').utils;
const _     = require('underscore');
const uuid  = require('node-uuid');

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

(() => {
  var sql = 'SELECT a.*, b.user_name FROM (SELECT * FROM s_user_log WHERE user_id=?) a LEFT JOIN s_user b ON (a.user_id=b.id) WHERE b.id IS NOT NULL ORDER BY a.create_time DESC';

  exports.findAll = function(user_id, cb){
    mysql.query(sql, [user_id], cb);
  };
})();

(() => {
  const sql = 'INSERT INTO s_user_log (id, log_desc, log_type, create_time, user_id) VALUES (?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, cb){

    var postData = [
      utils.replaceAll(uuid.v1(), '-', ''),
      newInfo.log_desc,
      newInfo.log_type || 1,
      new Date(),
      newInfo.user_id,
    ];

    mysql.query(sql, postData, cb);
  };
})();
