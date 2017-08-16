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
  exports.getByUserId = function(id, cb){

    if(!!cb && 'function' === typeof cb){
      return mysql.query(sql, [id], (err, docs) => {
        if(err) return cb(err);
        cb(null, mysql.checkOnly(docs) ? docs[0] : null);
      });
    }

    return new Promise((resolve, reject) => {
      mysql.query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();

(() => {
  const sql = 'INSERT INTO g_group_user (group_id, user_id, create_time, status, seat) VALUES (?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo){
    return new Promise((resolve, reject) => {

      newInfo.create_time = new Date();
      newInfo.status = 0;
      newInfo.seat = 0;

      var postData = [
        newInfo.group_id,
        newInfo.user_id,
        newInfo.create_time,
        newInfo.status,
        newInfo.seat,
      ];

      mysql.query(sql, postData, (err, status) => {
        if(err) return reject(err);
        resolve(newInfo);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              'c.group_name, '+
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
  var sql = 'UPDATE g_group_user SET status=?, offline_time=? WHERE user_id=?';

  /**
   *
   * @return
   */
  exports.editOffline = function(user_id, cb){
    mysql.query(sql, [2, new Date(), user_id], cb);
  };
})();

(() => {
  var sql = 'SELECT '+
              'c.group_name, '+
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
