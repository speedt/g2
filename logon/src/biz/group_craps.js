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

const logger = require('log4js').getLogger('biz.group_craps');

(() => {
  const sql = 'INSERT INTO g_group_craps (create_time, group_id, craps_1, craps_2, round_id, round_pno, round_no, user_id, user_seat, is_auto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(newInfo, trans){
    newInfo.create_time = new Date();
    newInfo.craps_1 = _.random(1, 6);
    newInfo.craps_2 = _.random(1, 6);
    newInfo.is_auto = newInfo.is_auto || 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        newInfo.create_time,
        newInfo.group_id,
        newInfo.craps_1,
        newInfo.craps_2,
        newInfo.round_id,
        newInfo.round_pno,
        newInfo.round_no,
        newInfo.user_id,
        newInfo.user_seat,
        newInfo.is_auto,
      ], err => {
        if(err) return reject(err);
        resolve(newInfo);
      });
    });
  };
})();
