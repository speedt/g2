/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd = process.cwd();

const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');
const uuid = require('node-uuid');

const md5 = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');

const _ = require('underscore');

(() => {
  var sql = 'SELECT a.* FROM s_manager a WHERE a.user_name=?';

  /**
   *
   * @return
   */
  exports.findByName = function(user_name, cb){
    mysql.query(sql, [user_name], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_manager a WHERE a.id=?';

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

/**
 * 游客登陆
 *
 * @return
 */

/**
 *
 * @return
 * @code 101 用户不存在
 * @code 102 禁止登陆
 * @code 103 用户名或密码输入错误
 */
exports.login = function(logInfo /* 用户名及密码 */, cb){
  var self = this;

  self.findByName(logInfo.user_name, (err, doc) => {
    if(err)  return cb(err);
    if(!doc) return cb(null, '101');

    // 用户的状态
    if(1 !== doc.status) return cb(null, '102');

    // 验证密码
    if(md5.hex(logInfo.user_pass) !== doc.user_pass)
      return cb(null, '103');

    cb(null, null, doc);
  });
};

(() => {
  var sql = 'UPDATE s_manager set USER_PASS=? WHERE id=?';

  /**
   *
   */
  exports.changePwd = function(newInfo, cb){
    newInfo.user_pass = utils.isEmpty(newInfo.user_pass);
    if(!newInfo.user_pass) return cb(null, '新密码不能为空');

    this.getById(newInfo.id, function (err, doc){
      if(err) return cb(err);
      if(!doc) return cb(null, '修改密码失败');

      if(md5.hex(newInfo.old_pass) !== doc.user_pass){
        return cb(null, '原始密码错误');
      }

      var postData = [
        md5.hex(newInfo.user_pass || '123456'),
        newInfo.id
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, null, status);
      });
    });
  };
})();
