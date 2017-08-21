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

const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const _  = require('underscore');
_.str    = require('underscore.string');
_.mixin(_.str.exports());

const logger = require('log4js').getLogger('biz.manager');

(() => {
  var sql = 'SELECT a.* FROM s_manager a WHERE a.user_name=?';

  /**
   *
   * @return
   */
  exports.getByName = function(user_name, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [user_name], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_manager a WHERE a.id=?';

  /**
   *
   * @return
   */
  exports.getById = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();

(() => {
  function p1(logInfo, user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户名或密码输入错误');
      // 用户状态
      if(1 !== user.status) return reject('禁止登陆');
      // 验证密码
      if(md5.hex(logInfo.user_pass) !== user.user_pass)
        return reject('用户名或密码输入错误');
      resolve(user);
    });
  }

  /**
   * 用户登陆
   *
   * @return
   */
  exports.login = function(logInfo /* 用户名及密码 */){
    return new Promise((resolve, reject) => {
      biz.manager.getByName(logInfo.user_name)
      .then(p1.bind(null, logInfo))
      .then(user => { resolve(user); })
      .catch(reject);
    });
  };
})();

(() => {
  function p1(logInfo){
    return new Promise((resolve, reject) => {
      logInfo.user_pass = utils.isEmpty(logInfo.user_pass);
      if(!logInfo.user_pass) return reject('新密码不能为空');
      resolve(logInfo);
    });
  }

  function p2(logInfo, user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户不存在');
      if(md5.hex(logInfo.old_pass) !== user.user_pass)
        return reject(null, '原始密码错误');
      resolve(user);
    });
  }

  function p3(user, trans){
    return new Promise((resolve, reject) => {
      user.user_pass = md5.hex(user.user_pass);

      (trans || mysql).query(sql, [
        user.user_pass,
        user.id,
      ], err => {
        if(err) return reject(err);
        resolve(user);
      });
    });
  }

  var sql = 'UPDATE s_manager set user_pass=? WHERE id=?';

  /**
   * 修改密码
   *
   * @return
   */
  exports.changePwd = function(logInfo){
    return new Promise((resolve, reject) => {
      p1(logInfo)
      .then(biz.manager.getById.bind(null, logInfo.id))
      .then(p2.bind(null, logInfo))
      .then(p3)
      .then(user => { resolve(user); })
      .catch(reject);
    });
  };
})();
