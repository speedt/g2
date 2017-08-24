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
  /**
   * 获取座位号
   *
   * @return
   */
  exports.getSeatNum = function(seat_sum){
    switch(seat_sum){
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
})();

(() => {
  const sql = 'INSERT INTO g_group_user (group_id, user_id, create_time, status, seat) VALUES (?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, trans){
    newInfo.create_time = new Date();
    newInfo.status = 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        newInfo.group_id,
        newInfo.user_id,
        newInfo.create_time,
        newInfo.status,
        newInfo.seat,
      ], err => {
        if(err) return reject(err);
        resolve(newInfo);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT COUNT(1) status_count FROM g_group_user WHERE status=? AND group_id=?';

  /**
   * 获取群组状态的数量
   *
   * @param group_id
   * @param status
   * @return
   */
  exports.getStatusCount = function(group_id, status, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [status, group_id], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? (docs[0]).status_count : null);
      });
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
  exports.editStatus = function(user_id, status, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [status, new Date(), user_id], err => {
        if(err) return reject(err);
        resolve();
      });
    });
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
  exports.findAllByUserId = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
      });
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
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
      });
    });
  };
})();
