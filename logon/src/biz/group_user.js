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
              'a.user_name, '+
              'b.* '+
            'FROM '+
              '(SELECT * FROM s_user WHERE server_id=? AND channel_id=?) a '+
              'LEFT JOIN g_group_user b ON (a.id=b.user_id) '+
              'LEFT JOIN g_group c ON (b.group_id=c.id) '+
            'WHERE '+
              'b.user_id IS NOT NULL';
  /**
   *
   * @return
   */
  exports.getByUserId = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      mysql.query(sql, [server_id, channel_id], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();
