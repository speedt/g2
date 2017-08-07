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
  var sql = 'SELECT a.*, b.user_name FROM (SELECT * FROM w_notice) a LEFT JOIN s_manager b ON (a.user_id=b.id) WHERE b.id IS NOT NULL ORDER BY a.create_time DESC';

  exports.findAll = function(cb){
    mysql.query(sql, null, (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

(() => {
  const sql = 'INSERT INTO w_notice (id, title, content, create_time, user_id) values (?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, cb){

    var postData = [
      utils.replaceAll(uuid.v1(), '-', ''),
      newInfo.title,
      newInfo.content,
      new Date(),
      newInfo.user_id
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  const sql = 'UPDATE w_notice SET TITLE=?, CONTENT=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.saveInfo = function(newInfo, cb){

    var postData = [
      newInfo.title,
      newInfo.content,
      newInfo.id
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM w_notice a WHERE a.id=?';

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
  var sql = 'DELETE FROM w_notice WHERE id=?';

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
