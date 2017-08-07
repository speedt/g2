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

const logger = require('log4js').getLogger('user_purchase');

(() => {
  var sql = 'SELECT b.user_name, c.goods_name, a.* FROM (SELECT * FROM s_user_purchase WHERE user_id=?) a LEFT JOIN s_user b ON (a.user_id=b.id) LEFT JOIN w_goods c ON (a.goods_id=c.id) WHERE b.id IS NOT NULL AND c.id IS NOT NULL ORDER BY a.create_time DESC';

  /**
   * 用户消费记录
   */
  exports.findAllByUserId = function(user_id, cb){
    mysql.query(sql, [user_id], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

(() => {
  const sql = 'INSERT INTO s_user_purchase (id, goods_id, create_time, user_id, order_id, status) values (?, ?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, cb, conn){

    var postData = [
      utils.replaceAll(uuid.v1(), '-', ''),
      newInfo.goods_id,
      new Date(),
      newInfo.user_id,
      newInfo.order_id,
      0
    ];

    conn.query(sql, postData, function (err, status){
      if(err) return cb(err);
      logger.trace('saveNew status: %j', status);
      cb(null, postData);
    });
  };
})();
