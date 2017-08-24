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
  var sql = 'SELECT '+
              'c.id group_id, c.group_name, c.status group_status, '+
              'b.status group_user_status, b.seat group_user_seat, '+
              'a.* '+
            'FROM '+
              '(SELECT * FROM s_user WHERE id=?) a '+
              'LEFT JOIN g_group_user b ON (b.user_id=a.id) '+
              'LEFT JOIN g_group c ON (b.group_id=c.id)';
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
  var sql = 'SELECT '+
              'c.id group_id, c.group_name, c.status group_status, '+
              'b.status group_user_status, b.seat group_user_seat, '+
              'a.* '+
            'FROM '+
              '(SELECT * FROM s_user WHERE server_id=? AND channel_id=?) a '+
              'LEFT JOIN g_group_user b ON (b.user_id=a.id) '+
              'LEFT JOIN g_group c ON (b.group_id=c.id)';
  /**
   *
   * @return
   */
  exports.getByChannelId = function(server_id, channel_id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [server_id, channel_id], (err, docs) => {
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

  function formVali(user_info){
    return new Promise((resolve, reject) => {
      if(!_.isString(user_info.user_name)) return reject('INVALID_PARAMS');
      user_info.user_name = _.trim(user_info.user_name);
      if(!regex_user_name.test(user_info.user_name)) return reject('INVALID_PARAMS');

      if(!_.isString(user_info.user_pass)) return reject('INVALID_PARAMS');
      user_info.user_pass = _.trim(user_info.user_pass);
      if(!regex_user_name.test(user_info.user_pass)) return reject('INVALID_PARAMS');

      resolve(user_info);
    });
  }

  function p1(user_info){
    return new Promise((resolve, reject) => {
      biz.user.getByName(user_info.user_name)
      .then(doc => {
        if(doc) return reject('用户名已存在');
        resolve(user_info);
      })
      .catch(reject);
    });
  }

  var sql = 'INSERT INTO s_user (id, user_name, user_pass, status, sex, create_time, mobile, qq, weixin, email, current_score, tool_1, tool_2, tool_3, tool_4, tool_5, tool_6, tool_7, tool_8, tool_9, nickname, vip, consume_count, win_count, lose_count, win_score_count, lose_score_count, line_gone_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  function p2(user_info){
    user_info.id = utils.replaceAll(uuid.v1(), '-', '');
    user_info.user_pass = md5.hex(user_info.user_pass);
    user_info.status = 1;
    user_info.sex = user_info.sex || 1;
    user_info.create_time = new Date();
    user_info.current_score = 0;
    user_info.tool_1 = 0;
    user_info.tool_2 = 0;
    user_info.tool_3 = 0;
    user_info.tool_4 = 0;
    user_info.tool_5 = 0;
    user_info.tool_6 = 0;
    user_info.tool_7 = 0;
    user_info.tool_8 = 0;
    user_info.tool_9 = 0;
    user_info.nickname = user_info.user_name;
    user_info.vip              = 0;
    user_info.consume_count    = 0;
    user_info.win_count        = 0;
    user_info.lose_count       = 0;
    user_info.win_score_count  = 0;
    user_info.lose_score_count = 0;
    user_info.line_gone_count  = 0;

    return new Promise((resolve, reject) => {
      mysql.query(sql, [
        user_info.id,
        user_info.user_name,
        user_info.user_pass,
        user_info.status,
        user_info.sex,
        user_info.create_time,
        user_info.mobile,
        user_info.qq,
        user_info.weixin,
        user_info.email,
        user_info.current_score,
        user_info.tool_1,
        user_info.tool_2,
        user_info.tool_3,
        user_info.tool_4,
        user_info.tool_5,
        user_info.tool_6,
        user_info.tool_7,
        user_info.tool_8,
        user_info.tool_9,
        user_info.nickname,
        user_info.vip,
        user_info.consume_count,
        user_info.win_count,
        user_info.lose_count,
        user_info.win_score_count,
        user_info.lose_score_count,
        user_info.line_gone_count,
      ], err => {
        if(err) return reject(err);
        resolve(user_info);
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
      .then(user_info => resolve(user_info))
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
        biz.user.authorize(user),
        biz.frontend.available(),
      ])
      .then(token => resolve(token))
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
      .then(token => resolve(token))
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
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [status, new Date(), id], err => {
        if(err) return reject(err);
        resolve();
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
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [md5.hex(user_pass || '123456'), id], err => {
        if(err) return reject(err);
        resolve();
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
  exports.editInfo = function(user, trans){
    user.current_score = user.current_score || 0;
    user.vip = user.vip || 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user.nickname,
        user.current_score,
        user.vip,
        user.id
      ], err => {
        if(err) return reject(err);
        resolve(user);
      });
    });
  };
})();

(() => {
  function p1(user){
    return new Promise((resolve, reject) => {
      mysql.query(sql, [
        user.server_id,
        user.channel_id,
        user.id,
      ], err => {
        if(err) return reject(err);
        resolve(user);
      });
    });
  }

  /**
   * 注册通道
   *
   * @return
   */
  exports.registerChannel = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.getByRedisChannelId(server_id, channel_id)
      .then(p1)
      .then(user => {
        logger.info('user login: %j', {
          log_type:    1,
          user_id:     user.id,
          create_time: _.now(),
        });
        resolve();
      })
      .catch(reject)
    });
  };

  var sql = 'UPDATE s_user SET server_id=?, channel_id=? WHERE id=?';

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
  const sha1      = '6a63911ac256b0c00cf270c6332119240d52b13e';

  /**
   * 令牌授权
   *
   * @param user
   * @return 登陆令牌
   */
  exports.authorize = function(user){
    return new Promise((resolve, reject) => {
      redis.evalsha(sha1, numkeys,
        conf.redis.database,                   /**/
        conf.app.client_id,                    /**/
        user.id,                               /**/
        utils.replaceAll(uuid.v4(), '-', ''),  /**/
        seconds, (err, code) => {
        if(err) return reject(err);
        resolve(code);
      });
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1    = '3b248050f9965193d8a4836d6258861a1890017f';

  exports.closeChannel = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      redis.evalsha(sha1, numkeys,
        conf.redis.database,  /**/
        server_id,            /**/
        channel_id,           /**/
        (err, code) => {
        if(err) return reject(err);
        if(!_.isArray(code)) return reject(code);
        resolve(utils.arrToObj(code));
      });
    });
  };
})();

(() => {
  function p1(user){
    logger.info('user logout: %j', {
      log_type:    2,
      user_id:     user.id,
      create_time: _.now(),
    });

    return new Promise((resolve, reject) => {
      resolve(user.id);
    });
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      biz.user.clearChannel(user.id)
      .then(p3.bind(null, user))
      .then(() => resolve(user.group_id))
      .catch(reject);
    });
  }

  function p3(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('通道不存在');
      if(!_.isNumber(user.group_user_seat)) return reject('不在任何群组');

      p4(user)
      .then(() => resolve())
      .catch(reject);
    });
  }

  function p4(user){
    if((0 < user.group_status) && (0 < user.group_user_seat)){
      return biz.group_user.editStatus(user.id, 2);
    }
    return biz.group_user.delByUserId(user.id);
  }

  /**
   *
   * @return
   */
  exports.logout = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.closeChannel(server_id, channel_id)
      .then(p1)
      .then(biz.user.getById)
      .then(p2)
      .then(biz.group_user.findAllByGroupId)
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1    = '6df440fb93a747912f3eae2835c8fec8e90788ca';

  /**
  * 获取用户信息（user_info_byChannelId.lua）
  *
  * @return
  */
  exports.getByRedisChannelId = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, code) => {
        if(err) return reject(err);
        if(!_.isArray(code)) return reject(code);
        resolve(utils.arrToObj(code));
      });
    });
  };
})();
