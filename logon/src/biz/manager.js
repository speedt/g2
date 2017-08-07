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

const uuid  = require('node-uuid');
const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;
const _     = require('underscore');

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;
const cfg   = require('emag.cfg');

(() => {
  var sql = 'SELECT a.* FROM s_manager a WHERE a.user_name=?';

  /**
   *
   * @return
   */
  exports.getByName = function(user_name, cb){
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
 *
 * @code 01 用户不存在
 * @code 02 禁止登陆
 * @code 03 用户名或密码输入错误
 *
 * @return
 */
exports.login = function(logInfo /* 用户名及密码 */, cb){
  var self = this;

  self.getByName(logInfo.user_name, (err, doc) => {
    if(err)  return cb(err);
    if(!doc) return cb(null, '01');

    // 用户的状态
    if(1 !== doc.status) return cb(null, '02');

    // 验证密码
    if(md5.hex(logInfo.user_pass) !== doc.user_pass)
      return cb(null, '03');

    cb(null, null, doc);
  });
};

(() => {
  var sql = 'UPDATE s_manager set user_pass=? WHERE id=?';

  /**
   *
   * @code 01 新密码不能为空
   * @code 02 用户不存在
   * @code 03 原始密码错误
   *
   * @return
   */
  exports.changePwd = function(newInfo, cb){
    newInfo.user_pass = utils.isEmpty(newInfo.user_pass);
    if(!newInfo.user_pass) return cb(null, '01');

    this.getById(newInfo.id, function (err, doc){
      if(err)  return cb(err);
      if(!doc) return cb(null, '02');

      if(md5.hex(newInfo.old_pass) !== doc.user_pass){
        return cb(null, '03');
      }

      var postData = [
        md5.hex(newInfo.user_pass),
        newInfo.id
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, null, status);
      });
    });
  };
})()
