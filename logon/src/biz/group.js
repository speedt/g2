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

const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const _  = require('underscore');
_.str    = require('underscore.string');
_.mixin(_.str.exports());

const logger = require('log4js').getLogger('biz.group');

(() => {
  var sql = '';

  /**
   *
   * @return
   */
  exports.search = function(cb){
    // todo
  };
})();

(() => {
  var sql = '';

  /**
   *
   * @return
   */
  exports.quit = function(cb){
    // todo
  };
})();

/**
 *
 * @return
 */
exports.entry = function(server_id, channel_id, group_id){

  return new Promise((resolve, reject) => {

    if(!_.isString(group_id)) return reject('invalid_group_id');

    group_id = _.trim(group_id);

    if('' === group_id) return reject('invalid_group_id');

    biz.group_user.getByUserId.call(null, server_id, channel_id).then(doc => {

      if(doc) return reject('must_be_quit');
      return biz.group.getById.call(null, group_id);
    }).then(doc => {

      if(!doc) return reject('non_existent_group');

      // 玩家数+游客数
      var user_count = (cfg.dynamic.group_type_pushCake.player_count - 0) + doc.visitor_count;

      logger.debug('group user count: %s::%s', doc.user_count, user_count);

      if(doc.user_count >= user_count) return reject('group_is_full');

      resolve();

    }).catch(reject);
  });
};

(() => {
  var sql = 'SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS user_count, a.* FROM g_group a WHERE a.id=?';

  /**
   *
   * @return
   */
  exports.getById = function(id){

    return new Promise((resolve, reject) => {

      mysql.query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();
