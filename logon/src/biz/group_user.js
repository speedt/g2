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
  const sql = 'INSERT INTO g_group_user (group_id, user_id, create_time, status) VALUES (?, ?, ?, ?)';

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
      ];

      mysql.query(sql, postData, (err, status) => {
        if(err) return reject(err);
        resolve(postData);
      });
    });
  };
})();
