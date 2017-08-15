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
  var sql = 'SELECT * FROM g_group_user WHERE group_id=? AND seat=?';
  /**
   *
   * @return
   */
  exports.getBySeat = function(newInfo, cb){

    if(!!cb && 'function' === typeof cb){
      return mysql.query(sql, [newInfo.group_id, newInfo.seat], (err, docs) => {
        if(err) return cb(err);
        cb(null, mysql.checkOnly(docs) ? docs[0] : null);
      });
    }

    return new Promise((resolve, reject) => {
      mysql.query(sql, [newInfo.group_id, newInfo.seat], (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              'c.group_name, '+
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
    mysql.query(sql, [id], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
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
      var postData = [
        newInfo.group_id,
        newInfo.user_id,
        new Date(),
        0,
        0,
      ];

      mysql.query(sql, postData, (err, status) => {
        if(err) return reject(err);
        resolve(postData);
      });
    });
  };
})();

(() => {
  const sql = 'UPDATE g_group_user SET seat=? WHERE user_id=?';

  /**
   * 换座位
   *
   * @param object seat     座位号
   * @param object user_id  用户id
   * @param object group_id 群组id
   * @return
   */
  exports.changeSeats = function(newInfo){
    return new Promise((resolve, reject) => {

      if(!_.isObject(newInfo))          return reject('params_error');
      if(!_.isString(newInfo.user_id))  return reject('params_error');
      if(!_.isString(newInfo.group_id)) return reject('params_error');
      if(!_.isNumber(newInfo.seat))     return reject('params_error');

      biz.group_user.getBySeat(newInfo, (err, doc) => {
        if(err) return reject(err);
        if(doc) return reject('non_idle_seat');

        mysql.query(sql, [newInfo.seat, newInfo.user_id], (err, status) => {
          if(err) return reject(err);

          biz.group_user.findAllByGroupId(newInfo.group_id, (err, docs) => {
            if(err) return reject(err);
            resolve(docs);
          });

        });
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
