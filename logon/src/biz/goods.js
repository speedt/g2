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
  var sql = 'SELECT a.* FROM w_goods a ORDER BY a.create_time DESC';

  exports.findAll = function(cb){
    mysql.query(sql, null, cb);
  };
})();

(() => {
  const sql = 'INSERT INTO w_goods (id, goods_name, goods_desc, create_time, cost, payment_id, disposable, interval_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, cb){

    var postData = [
      utils.replaceAll(uuid.v1(), '-', ''),
      newInfo.goods_name,
      newInfo.goods_desc,
      new Date(),
      newInfo.cost,
      newInfo.payment_id,
      newInfo.disposable,
      newInfo.interval_time,
    ];

    mysql.query(sql, postData, cb);
  };
})();

(() => {
  const sql = 'UPDATE w_goods SET goods_name=?, goods_desc=?, cost=?, payment_id=?, disposable=?, interval_time=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.editInfo = function(newInfo, cb){

    var postData = [
      newInfo.goods_name,
      newInfo.goods_desc,
      newInfo.cost,
      newInfo.payment_id,
      newInfo.disposable,
      newInfo.interval_time,
      newInfo.id,
    ];

    mysql.query(sql, postData, cb);
  };
})();

(() => {
  var sql = 'SELECT a.* FROM w_goods a WHERE a.id=?';

  /**
   *
   * @return
   */
  exports.getById = function(id, cb){
    mysql.query(sql, [id], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();

(() => {
  var sql = 'DELETE FROM w_goods WHERE id=?';

  /**
   *
   * @return
   */
  exports.del = function(id, cb){
    mysql.query(sql, [id], cb);
  };
})();
