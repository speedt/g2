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
  /**
   * 获取座位号
   *
   * @return
   */
  function getSeatNum(seat_count){
    switch(seat_count){
      case null: return 1;
      case 1:    return 2;  // base
      case 2:    return 1;  // base
      case 3:    return 4;
      case 4:    return 1;  // base
      case 5:    return 2;
      case 6:    return 1;
      case 7:    return 8;
      case 8:    return 1;  // base
      case 9:    return 2;
      case 10:   return 1;
      case 11:   return 4;
      case 12:   return 1;
      case 13:   return 2;
      case 14:   return 1;
      default:   return 0;
    }
  }

  function p1(group){
    return new Promise((resolve, reject) => {
      if(!group) return reject('群组不存在');
      resolve(getSeatNum(group.group_user_seat_sum));
    });
  }

  function p2(group_user_info, trans, seat){
    return new Promise((resolve, reject) => {
      group_user_info.create_time = new Date();
      group_user_info.status = 0;
      group_user_info.status_time = group_user_info.create_time;
      group_user_info.seat = seat;

      (trans || mysql).query(sql, [
        group_user_info.group_id,
        group_user_info.user_id,
        group_user_info.create_time,
        group_user_info.status,
        group_user_info.status_time,
        group_user_info.seat,
      ], err => {
        if(err) return reject(err);
        resolve(group_user_info);
      });
    });
  }

  const sql = 'INSERT INTO g_group_user (group_id, user_id, create_time, status, status_time, seat) VALUES (?, ?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, trans){
    return new Promise((resolve, reject) => {
      biz.group.getById(newInfo.group_id, trans)
      .then(p1)
      .then(p2.bind(null, newInfo, trans))
      .then(doc => { resolve(doc); })
      .catch(reject);
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
  exports.findAllByGroupId = function(id, trans){

    // if(!!cb && 'function' === typeof cb){
    //   return mysql.query(sql, [id], (err, docs) => {
    //     if(err) return cb(err);
    //     cb(null, docs);
    //   });
    // }

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
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
  exports.getStatusCount = function(status, group_id, trans){
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
  exports.delByUserId = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], err => {
        if(err) return reject(err);
        resolve();
      })
    });
  };
})();

(() => {
  var sql = 'DELETE FROM g_group_user WHERE group_id=?';

  /**
   *
   * @return
   */
  exports.delByGroupId = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], err => {
        if(err) return reject(err);
        resolve();
      })
    });
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
