/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');
const uuid       = require('node-uuid');
const _          = require('underscore');

const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const logger = require('log4js').getLogger('biz.gift');

(() => {
  var sql = 'SELECT d.type_name gift_type_name, c.goods_name, b.user_name, a.* FROM (SELECT * FROM w_gift WHERE user_id=?) a LEFT JOIN s_user b ON (a.user_id=b.id) LEFT JOIN w_goods c ON (a.goods_id=c.id) LEFT JOIN w_gift_type d ON (a.gift_type=d.id) WHERE b.id IS NOT NULL AND c.id IS NOT NULL AND d.id IS NOT NULL ORDER BY a.create_time DESC';

  exports.findAll = function(user_id, cb){
    mysql.query(sql, [user_id || 0], cb);
  };
})();
