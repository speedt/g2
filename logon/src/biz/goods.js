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
  var sql = 'SELECT a.* FROM w_goods a ORDER BY a.create_time DESC';

  exports.findAll = function(cb){
    mysql.query(sql, null, (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

(() => {
  const sql = 'INSERT INTO w_goods (id, goods_name, goods_desc, create_time, game_currency, cost, payment_id, disposable, interval_time) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';

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
      newInfo.game_currency || 0,
      newInfo.cost          || 0,
      newInfo.payment_id    || '',
      newInfo.disposable    || 1,
      newInfo.interval_time || 8,
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  const sql = 'UPDATE w_goods SET goods_name=?, goods_desc=?, game_currency=?, cost=?, payment_id=?, disposable=?, interval_time=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.saveInfo = function(newInfo, cb){

    var postData = [
      newInfo.goods_name,
      newInfo.goods_desc,
      newInfo.game_currency,
      newInfo.cost,
      newInfo.payment_id,
      newInfo.disposable,
      newInfo.interval_time,
      newInfo.id,
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
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
    mysql.query(sql, [id], (err, status) => {
      if(err) return cb(err);
        cb(null, status);
    });
  };
})();
