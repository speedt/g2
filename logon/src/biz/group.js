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

(() => {
  /**
   * 判断群组是否存在
   *
   * @param group_id 群组id
   * @return
   */
  function p1(group_id){
    return new Promise((resolve, reject) => {
      biz.group.getById(group_id, (err, doc) => {
        if(err) return reject(err);
        if(!doc) return reject('non_existent_group');
        resolve(doc);
      });
    });
  }

  /**
   * 判断群组是否满员
   *
   * @param group 群组对象
   * @return
   */
  function p2(group){
    return new Promise((resolve, reject) => {
      // 玩家数+游客数
      var user_count = (cfg.dynamic.group_type_pushCake.player_count - 0) + group.visitor_count;
      logger.debug('group user count: %s::%s', group.user_count, user_count);
      if(group.user_count >= user_count) return reject('group_is_full');
      resolve(group);
    });
  };

  /**
   * 判断用户所在群组
   *
   * @param user_id 用户id
   * @return
   */
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
  exports.entry = function(server_id, channel_id, group_id){

    return new Promise((resolve, reject) => {

      if(!_.isString(group_id)) return reject('invalid_group_id');

      group_id = _.trim(group_id);

      if('' === group_id) return reject('invalid_group_id');

      biz.user.getByChannelId(server_id, channel_id, (err, code, doc) => {
        if(err) return reject(err);
        if(code) return reject(code);

        var user = doc;

        p1(group_id)
        .then(p2)
        .then(p3.bind(null, user.id))
        .then(biz.group_user.saveNew.bind(null, {
          group_id: group_id,
          user_id: user.id,
        }))
        .then(group_user => {
          resolve(group_user);
        })
        .catch(reject);

      });
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
