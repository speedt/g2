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

const roomPool = require('emag.model').roomPool;

const logger = require('log4js').getLogger('biz.user');





































(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.status=? ORDER BY a.create_time DESC';

  exports.findAll = function(status, cb){
    mysql.query(sql, [status], cb);
  };
})();

(() => {
  /**
   * 并不是真删，而是改变状态
   *
   * @return
   */
  exports.del = function(id, cb){
    this.editStatus(id, 0, cb);
  };

  var sql = 'UPDATE s_user SET status=?, status_time=? WHERE id=?';

  /**
   * 编辑用户状态
   *
   * @return
   */
  exports.editStatus = function(id, status, cb){
    mysql.query(sql, [status, new Date(), id], cb);
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
    mysql.query(sql, [md5.hex(user_pass || '123456'), id], cb)
  };
})();

(() => {
  var sql = 'UPDATE s_user SET nickname=?, current_score=?, vip=? WHERE id=?';

  /**
   * 基本信息修改
   *
   * @return
   */
  exports.editInfo = function(user_info, trans){
    user_info.current_score = user_info.current_score || 0;
    user_info.vip           = user_info.vip           || 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user_info.nickname,
        user_info.current_score,
        user_info.vip,
        user_info.id
      ], err => {
        if(err) return reject(err);
        resolve(user_info);
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

    return biz.user.clearChannel(user.id);
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      if(!_.isNumber(user.group_user_seat)) return reject('用户不在任何群组');

      if(!user.group_id)

      p3(user)
      .then(() => resolve(user.group_id))
      .catch(reject);
    });
  }

  function p3(user){
    if((0 < user.group_status) && (0 < user.group_user_seat))
      return biz.group_user.forcedSignOut(user.id);
    return biz.group_user.delByUserId(user.id);
  }

  function p4(resolve, docs){
    var result = [];
    if(0 === docs.length) return resolve(result);
    result.push(docs);
    let data = [];
    data.push(docs);
    data.push(docs[0]);
    result.push(data);
    resolve(result);
  }


  function p2(user){
    return biz.user.findAllByGroupId(user.group_id);
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
      .then(p4.bind(null, resolve))
      .catch(reject);
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
  function p1(logInfo, user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户不存在');
      if(1 !== user.status) return reject('禁用状态');
      if(md5.hex(logInfo.user_pass) !== user.user_pass)
        return reject('用户名或密码输入错误');
      resolve(user);
    });
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      Promise.all([
        authorize(user),
        biz.frontend.available(),
      ])
      .then(token => resolve(token))
      .catch(reject);
    });
  }

  function authorize(user){
    return new Promise((resolve, reject) => {
      redis.evalsha('6a63911ac256b0c00cf270c6332119240d52b13e', 4,
        conf.redis.database,                   /**/
        conf.app.client_id,                    /**/
        user.id,                               /**/
        utils.replaceAll(uuid.v4(), '-', ''),  /**/
        5, (err, code) => {
        if(err) return reject(err);
        resolve(code);
      });
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
  const numkeys = 3;
  const sha1    = '6df440fb93a747912f3eae2835c8fec8e90788ca';

  /**
  * 获取用户信息（user_info_byChannelId.lua）
  *
  * @return
  */
  exports.getByRedisChannelId = function(server_id, channel_id){
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
  function p1(user_info){
    return new Promise((resolve, reject) => {
      biz.user.getById(user_info.id)
      .then(p2)
      .then(() => resolve())
      .catch(reject);
    });
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      biz.user.clearFreeGroupById(user.group_id)
      .then(p3)
      .then(() => resolve())
      .catch(reject)
    });
  }

  function p3(group_id){
    if(!group_id) return Promise.resolve();
  }

  /**
   * 注册通道
   *
   * @return
   */
  exports.registerChannel = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.getByRedisChannelId(server_id, channel_id)
      .then(editChannel)
      .then(p1)
      .then(biz.user.getByChannelId.bind(null, server_id, channel_id))
      .then(user => resolve(user))
      .catch(reject)
    });
  };

  var sql = 'UPDATE s_user SET server_id=?, channel_id=? WHERE id=?';

  function editChannel(user_info, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user_info.server_id,
        user_info.channel_id,
        user_info.id,
      ], err => {
        if(err) return reject(err);
        resolve(user_info);
      });
    });
  }

  /**
   * 清理通道
   *
   * @return
   */
  exports.clearChannel = function(id, trans){
    return editChannel({
      server_id: '',
      channel_id: '',
      id: id,
    }, trans);
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user WHERE id=?';

  /**
   * 获取用户
   *
   * @param id 用户id
   * @return
   */
  exports.getById = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        if(!mysql.checkOnly(docs)) return reject('用户不存在');
        resolve(docs[0]);
      });
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET group_id=? WHERE group_id=?';

  /**
   * 清理空闲的群组
   *
   * @return
   */
  exports.clearFreeGroupById = function(group_id, trans){
    if(!group_id) return Promise.reject('群组id不能为空');

    var room = roomPool.get(group_id);
    if(room) return Promise.resolve(group_id);

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, ['', group_id], err => {
        if(err) return reject(err);
        resolve();
      });
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user WHERE server_id=? AND channel_id=?';

  /**
   * 获取用户
   *
   * @param server_id
   * @param channel_id
   * @return
   */
  exports.getByChannelId = function(server_id, channel_id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [server_id, channel_id], (err, docs) => {
        if(err) return reject(err);
        if(!mysql.checkOnly(docs)) return reject('通道不存在');
        resolve(docs[0]);
      });
    });
  };
})();

(() => {

  function p1(user, group_id){
    user.backend_id = conf.app.id;
    user.group_id = group_id;
    user.group_entry_time = new Date();

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user.backend_id,
        user.group_id,
        user.group_entry_time,
        user.id,
      ], err => {
        if(err) return reject(err);
        resolve(user);
      })
    });
  }

  function p2(group_info, user){
    group_info.id = user.group_id;
    group_info.create_user_id = user.id;

    var room = roomPool.create(group_info);
    if(!room) return Promise.reject('创建群组失败');

    room.entry(user);

    return Promise.resolve();
  }

  /**
   * 创建群组
   *
   * @return
   */
  exports.createGroup = function(group_info, user, trans){
    return new Promise((resolve, reject) => {
      biz.user.genFreeGroupId()
      .then(p1.bind(null, user))
      .then(p2.bind(null, group_info))
      .then(() => resolve())
      .catch(reject);
    });
  };

  /**
   * 创建群组
   *
   * @return
   */
  exports.entryGroup = function(user_info, trans){
    user_info.backend_id = conf.app.id;
    user_info.group_entry_time = new Date();
    user_info.seat = 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user.backend_id,
        user.group_id,
        user.group_entry_time,
        user.id,
      ], err => {
        if(err) return reject(err);
        resolve();
      })
    });
  };


  var sql = 'UPDATE s_user SET backend_id=?, group_id=?, group_entry_time=? WHERE id=?';

  function editGroup(user_info, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        user_info.backend_id,
        user_info.group_id,
        user_info.group_entry_time,
        user_info.id,
      ], err => {
        if(err) return reject(err);
        resolve(user_info);
      })
    });
  }

  /**
   * 创建群组
   *
   * @return
   */
  exports.quitGroup = function(user_id, trans){
    var user_info = {
      backend_id: '',
      group_id: '',
      group_entry_time: null,
      id: user_id,
    };

    return editGroup(user_info, trans);
  };
})();

(() => {
  function p1(cb, trans){
    var id = _.random(100000, 999999);
    biz.user.findAllByGroupId(id, trans)
    .then(docs => {
      if(0 < docs.length) return p1(cb, trans);
      cb(null, id);
    })
    .catch(cb);
  }

  /**
   * 生成空闲的群组id
   *
   * @return
   */
  exports.genFreeGroupId = function(trans){
    return new Promise((resolve, reject) => {
      p1((err, id) => {
        if(err) return reject(err);
        resolve(id);
      }, trans);
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.group_id=? ORDER BY a.group_entry_time ASC';

  /**
   * 获取群组的全部用户
   *
   * @param id 群组id
   * @return
   */
  exports.findAllByGroupId = function(id, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [id], (err, docs) => {
        if(err) return reject(err);
        resolve(docs);
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
      if(!_.isString(user_info.user_name)) return reject('invalid_params');
      user_info.user_name = _.trim(user_info.user_name);
      if(!regex_user_name.test(user_info.user_name)) return reject('invalid_params');

      if(!_.isString(user_info.user_pass)) return reject('invalid_params');
      user_info.user_pass = _.trim(user_info.user_pass);
      if(!regex_user_name.test(user_info.user_pass)) return reject('invalid_params');

      resolve(user_info);
    });
  }

  function p1(user_info){
    return new Promise((resolve, reject) => {
      biz.user.getByName(user_info.user_name)
      .then(user => {
        if(user) return reject('用户名已存在');
        resolve(user_info);
      })
      .catch(reject);
    });
  }

  var sql = 'INSERT INTO s_user (id, user_name, user_pass, status, create_time, mobile, weixin, current_score, nickname, vip, consume_count, win_count, lose_count, win_score_count, lose_score_count, line_gone_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  function p2(user_info){
    user_info.id               = utils.replaceAll(uuid.v1(), '-', '');
    user_info.user_pass        = md5.hex(user_info.user_pass);
    user_info.status           = 1;
    user_info.create_time      = new Date();
    user_info.current_score    = 0;
    user_info.nickname         = user_info.user_name;
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
        user_info.create_time,
        user_info.mobile,
        user_info.weixin,
        user_info.current_score,
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
