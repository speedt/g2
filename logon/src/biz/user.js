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

const logger = require('log4js').getLogger('biz.user');

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.status=? ORDER BY a.create_time DESC';

  exports.findAll = function(status, cb){
    mysql.query(sql, [status], cb);
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.user_name=?';

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
  var sql = 'SELECT a.* FROM s_user a WHERE a.id=?';

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

(() => {
  // 2-10个字符，支持中文，英文大小写、数字、下划线
  var regex_user_name = /^[\u4E00-\u9FA5a-zA-Z0-9_]{2,10}$/;
  // 6-16个字符，支持英文大小写、数字、下划线，区分大小写
  var regex_user_pass = /^[a-zA-Z0-9_]{6,16}$/;

  /**
   *
   * @code 01 昵称不能为空
   * @code 02 密码不能为空
   *
   * @return
   */
  function formVali(newInfo){
    newInfo.user_name = newInfo.user_name || '';
    newInfo.user_name = newInfo.user_name.trim();
    if(!regex_user_name.test(newInfo.user_name)) return '01';

    newInfo.user_pass = newInfo.user_pass || '';
    newInfo.user_pass = newInfo.user_pass.trim();
    if(!regex_user_name.test(newInfo.user_pass)) return '02';
  }

  var sql = 'INSERT INTO s_user (id, user_name, user_pass, status, sex, create_time, mobile, qq, weixin, email, current_score, tool_1, tool_2, tool_3, tool_4, tool_5, tool_6, tool_7, tool_8, tool_9, nickname, vip, consume_count, win_count, lose_count, win_score_count, lose_score_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   * 用户注册
   *
   * @code 01 昵称已经存在
   *
   * @return
   */
  exports.register = function(newInfo, cb){
    var self = this;

    var code = formVali(newInfo);
    if(code) return cb(null, 'formVali_'+ code);

    self.getByName(newInfo.user_name, function (err, doc){
      if(err) return cb(err);
      if(doc) return cb(null, '01');

      // params
      var postData = [
        utils.replaceAll(uuid.v1(), '-', ''),
        newInfo.user_name,
        md5.hex(newInfo.user_pass),
        newInfo.status        || 1,
        newInfo.sex           || 1,
        new Date(),
        newInfo.mobile        || '',
        newInfo.qq            || '',
        newInfo.weixin        || '',
        newInfo.email         || '',
        newInfo.current_score || 0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        newInfo.user_name || '',
        0,
        0,
        0,
        0,
        0,
        0,
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, null, postData);
      });
    });
  };
})();

/**
 * 用户登陆
 *
 * @code 01 用户名或密码输入错误
 * @code 02 禁止登陆
 * @code 03 用户名或密码输入错误
 *
 * @return
 */
exports.login = function(logInfo /* 用户名及密码 */, cb){
  var self = this;
};

(() => {
  var sql = 'UPDATE s_user SET status=? WHERE id=?';

  /**
   * 并不是真删，而是改变状态
   *
   * @return
   */
  exports.del = function(id, status, cb){
    mysql.query(sql, [status || 0, id], cb);
  };
})();

(() => {
  var sql = 'UPDATE s_user SET user_pass=? WHERE id=?';

  /**
   * 重置密码
   *
   * @return
   */
  exports.resetPwd = function(id, user_pass, cb){
    mysql.query(sql, [md5.hex(user_pass), id], cb);
  };
})();

(() => {
  var sql = 'UPDATE s_user SET nickname=?, current_score=?, vip=? WHERE id=?';

  /**
   * 基本信息修改
   *
   * @return
   */
  exports.editInfo = function(newInfo, cb){

    var postData = [
      newInfo.nickname,
      newInfo.current_score,
      newInfo.vip,
      newInfo.id
    ];

    mysql.query(sql, postData, cb);
  };
})();
