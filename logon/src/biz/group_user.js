/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const uuid = require('node-uuid');
const _    = require('underscore');

const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const logger = require('log4js').getLogger('biz.group_user');

(() => {
  var sql = 'SELECT '+
              'c.group_name, c.status group_status, '+
              'b.user_name, '+
              'a.* '+
            'FROM '+
              '(SELECT * FROM g_group_user WHERE user_id=?) a '+
              'LEFT JOIN s_user b ON (a.user_id=b.id) '+
              'LEFT JOIN g_group c ON (a.group_id=c.id) '+
            'WHERE '+
              'b.id IS NOT NULL';
  /**
   *
   * @return
   */
  exports.getByUserId = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();

(() => {
  const sql = 'INSERT INTO g_group_user (group_id, user_id, create_time, status, seat) VALUES (?, ?, ?, ?, ?)';

  /**
   * 获取座位号
   *
   * @return
   */
  function getSeatNum(seat_count){
    switch(seat_count){
      case 1:  return 2;  // base
      case 2:  return 1;  // base
      case 3:  return 4;
      case 4:  return 1;  // base
      case 5:  return 2;
      case 6:  return 1;
      case 7:  return 8;
      case 8:  return 1;  // base
      case 9:  return 2;
      case 10: return 1;
      case 11: return 4;
      case 12: return 1;
      case 13: return 2;
      case 14: return 1;
      default: return 0;
    }
  }

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, trans){
    return new Promise((resolve, reject) => {

      newInfo.create_time = new Date();
      newInfo.status = 0;

      var postData = [
        newInfo.group_id,
        newInfo.user_id,
        newInfo.create_time,
        newInfo.status,
      ];

      if(newInfo.seat){
        postData.push(newInfo.seat);

        return (trans || mysql).query(sql, postData, (err, status) => {
          if(err) return reject(err);
          resolve(newInfo);
        });
      }

      biz.group_user.getSeatNumCount(newInfo.group_id, (err, doc) => {
        if(err) return reject(err);
        if(!doc) return reject(new Error('seat_count_is_null'));

        newInfo.seat = getSeatNum(doc.seat_count);

        postData.push(newInfo.seat);

        (trans || mysql).query(sql, postData, (err, status) => {
          if(err) return reject(err);
          resolve(newInfo);
        });
      }, trans);
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              'c.group_name, c.status group_status, '+
              'b.user_name, b.server_id, b.channel_id, '+
              'a.* '+
            'FROM '+
              '(SELECT * FROM g_group_user WHERE group_id=?) a '+
              'LEFT JOIN s_user b ON (a.user_id=b.id) '+
              'LEFT JOIN g_group c ON (a.group_id=c.id) '+
            'WHERE '+
              'b.id IS NOT NULL AND '+
              'c.id IS NOT NULL '+
            'ORDER BY a.create_time ASC';
  /**
   *
   * @return
   */
  exports.findAllByGroupId = function(id, cb){

    if(!!cb && 'function' === typeof cb){
      return mysql.query(sql, [id], (err, docs) => {
        if(err) return cb(err);
        cb(null, docs);
      });
    }

    return new Promise((resolve, reject) => {
      mysql.query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT COUNT(1) status_count FROM g_group_user WHERE status=? AND group_id=?';

  /**
   * 获取群组状态的数量
   *
   * @param status
   * @param group_id
   * @return
   */
  exports.getStatusCount = function(status, group_id, cb, trans){
    (trans || mysql).query(sql, [status, group_id], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();

(() => {
  var sql = 'DELETE FROM g_group_user WHERE user_id=?';

  /**
   *
   * @return
   */
  exports.delByUserId = function(id, cb){
    mysql.query(sql, [id], cb);
  };
})();

(() => {
  var sql = 'UPDATE g_group_user SET status=?, status_time=? WHERE user_id=?';

  /**
   * 用户状态
   *
   * 0、默认
   * 1、举手
   * 2、玩家离线
   *
   * @return
   */
  exports.editStatus = function(user_id, status, cb, trans){
    (trans || mysql).query(sql, [status, new Date(), user_id], cb);
  };
})();

(() => {
  var sql = 'SELECT '+
              'c.group_name, c.status group_status, '+
              'b.user_name, b.server_id, b.channel_id, '+
              'a.* '+
            'FROM '+
              '(SELECT * FROM g_group_user WHERE group_id=(SELECT group_id FROM g_group_user WHERE user_id=?)) a '+
              'LEFT JOIN s_user b ON (a.user_id=b.id) '+
              'LEFT JOIN g_group c ON (a.group_id=c.id) '+
            'WHERE '+
              'b.id IS NOT NULL AND '+
              'c.id IS NOT NULL '+
            'ORDER BY a.create_time ASC';
  /**
   *
   * @return
   */
  exports.findAllByUserId = function(id, cb){

    if(!cb){
      return new Promise((resolve, reject) => {
        mysql.query(sql, [id], (err, docs) => {
          if(err) return reject(err);
          resolve(docs);
        });
      });
    }

    mysql.query(sql, [id], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

(() => {
  var sql = 'SELECT SUM(seat) seat_count FROM g_group_user WHERE group_id=?';

  /**
   * 座位号总和
   *
   * @return
   */
  exports.getSeatNumCount = function(group_id, cb, trans){
    (trans || mysql).query(sql, [group_id], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();
