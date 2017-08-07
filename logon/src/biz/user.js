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
    mysql.query(sql, [status], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
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

/**
 * 用户注册
 *
 * @params
 * @return
 */
(() => {
  // 2-10个字符，支持中文，英文大小写、数字、下划线
  var regex_user_name = /^[\u4E00-\u9FA5a-zA-Z0-9_]{2,10}$/;
  // 6-16个字符，支持英文大小写、数字、下划线，区分大小写
  var regex_user_pass = /^[a-zA-Z0-9_]{6,16}$/;

  function formVali(newInfo){
    newInfo.user_name = newInfo.user_name || '';
    newInfo.user_name = newInfo.user_name.trim();
    if(!regex_user_name.test(newInfo.user_name)) return '昵称不能为空';

    newInfo.user_pass = newInfo.user_pass || '';
    newInfo.user_pass = newInfo.user_pass.trim();
    if(!regex_user_name.test(newInfo.user_pass)) return '密码不能为空';
  }

  var sql = 'INSERT INTO s_user (id, user_name, user_pass, status, sex, create_time, mobile, qq, weixin, email, device_code, score, bullet_level, tool_1, tool_2, tool_3, tool_4, tool_5, tool_6, tool_7, tool_8, tool_9, nickname, diamond, vip, purchase_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  exports.register = function(newInfo, cb){

    var self = this;

    var warn = formVali(newInfo);

    if(warn) return cb(null, warn);

    self.findByName(newInfo.user_name, function (err, doc){
      if(err) return cb(err);
      if(doc) return cb(null, '昵称已经存在');

      // params
      var postData = [
        utils.replaceAll(uuid.v1(), '-', ''),
        newInfo.user_name,
        md5.hex(newInfo.user_pass),
        newInfo.status      || 1,
        newInfo.sex         || 1,
        new Date(),
        newInfo.mobile      || '',
        newInfo.qq          || '',
        newInfo.weixin      || '',
        newInfo.email       || '',
        newInfo.device_code || '',
        newInfo.score       || 0,
        1,
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
        0
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, null, postData);
      });
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
 * @code 101 用户名或密码输入错误
 * @code 102 禁止登陆
 * @code 103 用户名或密码输入错误
 */
exports.login = function(logInfo /* 用户名及密码 */, cb){
  var self = this;

  self.findByName(logInfo.user_name, (err, doc) => {
    if(err) return cb(err);
    if(!doc) return cb(null, '101');

    // 用户的状态
    if(1 !== doc.status) return cb(null, '102');

    // 验证密码
    if(md5.hex(logInfo.user_pass) !== doc.user_pass)
      return cb(null, '103');

    var p1 = new Promise((resolve, reject) => {
      self.authorize(doc, (err, code) => {
          if(err) return reject(err);
          resolve(code);
      });
    });

    var p2 = new Promise((resolve, reject) => {
      // 服务器可用性
      server.available((err, info) => {
        if(err) return reject(err);
        resolve(info);
      });
    });

    Promise.all([p1, p2]).then(values => {
      cb(null, null, values);
    }).catch(cb);

  });
};

(() => {
  const seconds = 5;  //令牌有效期 5s
  const numkeys = 4;
  const sha1 = '391dc0b72e8ac3029da5ee8bfd4b4dc3ad245840';
  const client_id = '5a2c6a1043454b168e6d3e8bef5cbce2';

  /**
   * 令牌授权
   *
   * @param user_id
   * @param client_id
   * @return 登陆令牌
   */
  exports.authorize = function(doc, cb){
    var code = utils.replaceAll(uuid.v4(), '-', '');

    delete doc.user_pass;

    redis.evalsha(sha1, numkeys,
      conf.redis.database, client_id, doc.id, code,
      seconds,
      JSON.stringify(doc),
      doc.score  || 0,
      doc.tool_1 || 0,
      doc.tool_2 || 0,
      doc.tool_3 || 0,
      doc.tool_4 || 0,
      doc.tool_5 || 0,
      doc.tool_6 || 0,
      doc.tool_7 || 0,
      doc.tool_8 || 0,
      doc.tool_9 || 0,
      doc.bullet_level || 1,
      doc.diamond      || 0,
      1,
      doc.bullet_consume_count || 0,
      doc.gain_score_count     || 0,
      doc.gift_count           || 0,
      doc.vip,
      doc.user_name,
      (err, code) => {
        if(err) return cb(err);
        cb(null, code);
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1 = '243ee192b64ae839b6d4d974f29d73b56f8526f2';

  /**
   * channel_close.lua
   */
  exports.logout = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    this.saveInfo(server_id, channel_id, function (err){
      if(err) return cb(err);

      redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, code) => {
        if(err) return cb(err);
        cb(null, code);
      });
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1 = '6df440fb93a747912f3eae2835c8fec8e90788ca';

  /**
   * my_info.lua
   */
  exports.myInfo = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, doc) => {
        if(err) return cb(err);

        if(!_.isArray(doc)) return;

        cb(null, cfg.arrayToObject(doc));
    });
  };
})();

(() => {
  const numkeys = 2;
  const sha1 = '7a37ef6afacc93605536b75a22e566062570a61f';

  /**
   * user_info.lua
   *
   * @return
   */
  exports.userInfo = function(user_id, cb){

    redis.evalsha(sha1, numkeys, conf.redis.database, user_id, (err, code) => {
        if(err) return cb(err);
        cb(null, code);
    });
  };
})();

(() => {
  const sql = 'UPDATE s_user SET SCORE=?, BULLET_CONSUME_COUNT=?, GAIN_SCORE_COUNT=?, GIFT_COUNT=? WHERE id=?';

  /**
   *
   * 保存游戏分值等信息
   *
   * @return
   */
  exports.saveInfo = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    this.myInfo(server_id, channel_id, function (err, doc){
      if(err)              return cb(err);
      if(!_.isObject(doc)) return;
      if(!doc.id)          return;
      if(!doc.score)       return;

      var postData = [
        doc.score,
        doc.bullet_consume_count,
        doc.gain_score_count,
        doc.gift_count,
        doc.id
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, status);
      });
    });
  };
})();

(() => {
  const sql = 'UPDATE s_user SET NICKNAME=?, SCORE=?, GIFT_COUNT=? WHERE id=?';

  /**
   *
   * 修改用户基本信息
   *
   * @return
   */
  exports.saveBaseInfo = function(newInfo, cb){

    // newInfo.bullet_level = newInfo.bullet_level || 1;
    // newInfo.bullet_level = (1 > newInfo.bullet_level || 100 < newInfo.bullet_level) ? 1 : newInfo.bullet_level;

    var postData = [
      newInfo.nickname,
      newInfo.score,
      // newInfo.bullet_level,
      newInfo.gift_count,
      newInfo.id
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET STATUS=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.del = function(id, status, cb){
    mysql.query(sql, [status, id], (err, status) => {
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET USER_PASS=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.resetPwd = function(id, user_pass, cb){
    mysql.query(sql, [md5.hex(user_pass), id], (err, status) => {
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();