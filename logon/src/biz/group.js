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
  function p1(user){
    return new Promise((resolve, reject) => {
      if(0 === user.group_status){
        return biz.group_user.delByUserId(user.id, (err, status) => {
          if(err) return reject(err);
          resolve(user.id);
        });
      }

      biz.group_user.editOffline(user.id, (err, status) => {
        if(err) return reject(err);
        resolve(user.id);
      });
    });
  }

  /**
   *
   * @return
   */
  exports.quit = function(user){
    return new Promise((resolve, reject) => {

      if(!user.group_id) return reject('not_in_any_group');

      p1(user)
      .then(biz.group_user.findAllByGroupId)
      .catch(reject);
    });
  };
})();

(() => {
  function p1(group_id){
    return new Promise((resolve, reject) => {
      biz.group.getById(group_id, (err, doc) => {
        if(err) return reject(err);
        if(!doc) return reject('non_existent_group');
        resolve(doc);
      });
    });
  }

  function p2(group){
    return new Promise((resolve, reject) => {
      // 玩家数+游客数
      var user_count = (cfg.dynamic.group_type_pushCake.player_count - 0) + group.visitor_count;
      logger.debug('group user count: %s::%s', group.user_count, user_count);
      if(group.user_count >= user_count) return reject('group_is_full');
      resolve();
    });
  };

  function p3(user_id){
    return new Promise((resolve, reject) => {
      biz.group_user.getByUserId(user_id, (err, doc) => {
        if(err) return reject(err);
        if(doc) return reject('must_be_quit');
        resolve();
      });
    });
  };

  /**
   *
   * @return
   */
  exports.entry = function(group_id, user){
    return new Promise((resolve, reject) => {

      if(!_.isString(group_id)) return reject('invalid_group_id');
      group_id = _.trim(group_id);
      if('' === group_id) return reject('invalid_group_id');

      p1(group_id)  /* 判断群组是否存在 */
      .then(p2)  /* 判断群组是否满员 */
      .then(p3.bind(null, user.id))  /* 如果用户已在某一群组，则提示先退出 */
      .then(biz.group_user.saveNew.bind(null, {
        group_id: group_id,
        user_id: user.id,
      }))
      .then(biz.group_user.findAllByGroupId.bind(null, group_id))
      .then(group_users => resolve(group_users))
      .catch(reject);
    });

  };
})();



(() => {
  var sql = 'SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS user_count, a.* FROM g_group a WHERE a.id=?';

  /**
   *
   * @return
   */
  exports.getById = function(id, cb){
    mysql.query(sql, [id], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();
