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

const logger = require('log4js').getLogger('biz.user');

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.status=? ORDER BY a.create_time DESC';

  exports.findAll = function(status, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [status], (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.user_name=?';

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
  var sql = 'SELECT * FROM s_user WHERE id=?';
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
  // 2-10个字符，支持中文，英文大小写、数字、下划线
  var regex_user_name = /^[\u4E00-\u9FA5a-zA-Z0-9_]{2,10}$/;
  // 6-16个字符，支持英文大小写、数字、下划线，区分大小写
  var regex_user_pass = /^[a-zA-Z0-9_]{6,16}$/;

  /**
   *
   * @return
   */
  function formVali(user){
    return new Promise((resolve, reject) => {
      if(!_.isString(user.user_name)) return reject('INVALID_PARAMS');
      user.user_name = _.trim(user.user_name);
      if(!regex_user_name.test(user.user_name)) return reject('INVALID_PARAMS');

      if(!_.isString(user.user_pass)) return reject('INVALID_PARAMS');
      user.user_pass = _.trim(user.user_pass);
      if(!regex_user_name.test(user.user_pass)) return reject('INVALID_PARAMS');

      resolve(user);
    });
  }

  function p1(user){
    return new Promise((resolve, reject) => {
      biz.user.getByName(user.user_name)
      .then(doc => {
        if(doc) return reject('用户名已存在');
        resolve(user);
      })
      .catch(reject);
    });
  }

  var sql = 'INSERT INTO s_user (id, user_name, user_pass, status, sex, create_time, mobile, qq, weixin, email, current_score, tool_1, tool_2, tool_3, tool_4, tool_5, tool_6, tool_7, tool_8, tool_9, nickname, vip, consume_count, win_count, lose_count, win_score_count, lose_score_count, line_gone_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  function p2(user, trans){
    user.id = utils.replaceAll(uuid.v1(), '-', '');
    user.user_pass = md5.hex(user.user_pass);
    user.status = user.status || 1;
    user.sex = user.sex || 1;
    user.create_time = new Date();
    user.current_score = user.current_score || 0;
    user.tool_1 = 0;
    user.tool_2 = 0;
    user.tool_3 = 0;
    user.tool_4 = 0;
    user.tool_5 = 0;
    user.tool_6 = 0;
    user.tool_7 = 0;
    user.tool_8 = 0;
    user.tool_9 = 0;
    user.nickname = user.user_name;
    user.vip              = 0;
    user.consume_count    = 0;
    user.win_count        = 0;
    user.lose_count       = 0;
    user.win_score_count  = 0;
    user.lose_score_count = 0;
    user.line_gone_count  = 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user.id,
        user.user_name,
        user.user_pass,
        user.status,
        user.sex,
        user.create_time,
        user.mobile,
        user.qq,
        user.weixin,
        user.email,
        user.current_score,
        user.tool_1,
        user.tool_2,
        user.tool_3,
        user.tool_4,
        user.tool_5,
        user.tool_6,
        user.tool_7,
        user.tool_8,
        user.tool_9,
        user.nickname,
        user.vip,
        user.consume_count,
        user.win_count,
        user.lose_count,
        user.win_score_count,
        user.lose_score_count,
        user.line_gone_count,
      ], err => {
        if(err) return reject(err);
        resolve(user);
      });
    });
  }

  /**
   * 用户注册
   *
   * @return
   */
  exports.register = function(newInfo){
    return new Promise((resolve, reject) => {
      formVali(newInfo)
      .then(p1)
      .then(p2)
      .then(user => { resolve(user); })
      .catch(reject);
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

  function p2(user){
    return new Promise((resolve, reject) => {
      Promise.all([
        biz.user.authorize.bind(null, user),
        biz.frontend.available
      ])
      .then(values => { resolve(values); })
      .catch(reject);
    });
  }

  /**
   * 用户登陆
   *
   * @return
   */
  exports.login = function(logInfo /* 用户名及密码 */){
    return new Promise((resolve, reject) => {
      biz.user.getByName(logInfo.user_name)
      .then(p1.bind(null, logInfo))
      .then(p2)
      .then(token => { resolve(token); })
      .catch(reject);
    });
  };
})();

(() => {
  /**
   * 并不是真删，而是改变状态
   *
   * @return
   */
  exports.del = function(id, trans){
    return biz.user.editStatus(id, 0, trans);
  };

  var sql = 'UPDATE s_user SET status=?, status_time=? WHERE id=?';

  /**
   * 编辑用户状态
   *
   * @return
   */
  exports.editStatus = function(id, status, trans){
    var status_time = new Date();
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [status, status_time, id], err => {
        if(err) return reject(err);
        resolve(status_time);
      });
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET user_pass=? WHERE id=?';

  /**
   * 重置密码
   *
   * @return
   */
  exports.resetPwd = function(id, user_pass, trans){
    user_pass = md5.hex(user_pass || '123456');
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [user_pass, id], err => {
        if(err) return reject(err);
        resolve(user_pass);
      });
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET nickname=?, current_score=?, vip=? WHERE id=?';

  /**
   * 基本信息修改
   *
   * @return
   */
  exports.editInfo = function(user){

    user.current_score = user.current_score || 0;
    user.vip = user.vip || 0;

    var postData = [
      user.nickname,
      user.current_score,
      user.vip,
      user.id
    ];

    return new Promise((resolve, reject) => {
      mysql.query(sql, postData, err => {
        if(err) return reject(err);
        resolve(user);
      });
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET server_id=?, channel_id=? WHERE id=?';

  /**
   * 注册通道
   *
   * @return
   */
  exports.registerChannel = function(server_id, channel_id, user, trans){

    user.server_id = server_id;
    user.channel_id = channel_id;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user.server_id,
        user.channel_id,
        user.id,
      ], err => {
        if(err) return reject(err);
        resolve(user);
      });
    });
  };

  /**
   * 清理通道
   *
   * @return
   */
  exports.clearChannel = function(user_id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, ['', '', user_id], err => {
        if(err) return reject(err);
        resolve();
      });
    });
  };
})();

(() => {
  const seconds   = 5;  //令牌有效期 5s
  const numkeys   = 4;
  const sha1      = 'd8f515be193e9d7a0bce3bbb27d358702b6150f6';

  /**
   * 令牌授权
   *
   * @param user
   * @return 登陆令牌
   */
  exports.authorize = function(user){
    return new Promise((resolve, reject) => {
      var code = utils.replaceAll(uuid.v4(), '-', '');
      redis.evalsha(sha1, numkeys, conf.redis.database, conf.app.client_id, user.id, code, seconds, (err, code) => {
        if(err) return reject(err);
        resolve(code);
      });
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1    = '3b248050f9965193d8a4836d6258861a1890017f';

  function p1(server_id, channel_id){
    return new Promise((resolve, reject) => {
      redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, code) => {
        if(err) return reject(err);
        if(!_.isArray(code)) return reject(code);
        resolve(utils.arrToObj(code));
      });
    });
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      if(user) return resolve(user.id);
      reject('NOT_FOUND_USER');
    });
  }

  /**
   * 用户退出（channel_close.lua）
   *
   * @return
   */
  exports.logout = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      p1(server_id, channel_id)
      .then(p2)
      .then(biz.user.clearChannel)
      .then(() => { resolve(); })
      .catch(reject);
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1    = '6df440fb93a747912f3eae2835c8fec8e90788ca';

  function p1(server_id, channel_id){
    return new Promise((resolve, reject) => {
      redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, code) => {
        if(err) return reject(err);
        if(!_.isArray(code)) return reject(code);
        resolve(utils.arrToObj(code));
      });
    });
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      if(user) return resolve(user.id);
      reject('NOT_FOUND_USER');
    });
  }

  /**
   * 获取用户信息（user_info_byChannelId.lua）
   *
   * @return
   */
  exports.getByChannelId = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      p1(server_id, channel_id)
      .then(p2)
      .then(biz.user.getById)
      .then(user => { resolve(user); })
      .catch(reject);
    });
  };
})();
