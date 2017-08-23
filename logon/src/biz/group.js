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
  var sql = 'UPDATE g_group SET status=?, status_time=? WHERE id=?';

  /**
   * 用户状态
   *
   * 0、默认
   * 1、4人举手（游戏开始）
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
  const sql = 'INSERT INTO g_group (id, group_name, group_type, create_time, create_user_id, status, visitor_count, extend_fund, extend_round_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @param group 群组
   * @return
   */
  exports.saveNew = function(group_info, trans){
    return new Promise((resolve, reject) => {
      group_info.group_name = group_info.group_name || ('房间'+ group_info.id);
      group_info.create_time = new Date();
      group_info.status = 0;

      (trans || mysql).query(sql, [
        group_info.id,
        group_info.group_name,
        group_info.group_type,
        group_info.create_time,
        group_info.create_user_id,
        group_info.status,
        group_info.visitor_count,
        group_info.extend_fund,
        group_info.extend_round_count,
      ], err => {
        if(err) return reject(err);
        resolve(group_info);
      });
    });
  };
})();

(() => {
  function p1(group_info){
    return new Promise((resolve, reject) => {
      if(!_.isNumber(group_info.extend_fund)) return reject('INVALID_PARAMS');
      if(999999 < group_info.extend_fund || 0 > group_info.extend_fund) return reject('INVALID_PARAMS');

      if(!_.isNumber(group_info.extend_round_count)) return reject('INVALID_PARAMS');
      if(4 < group_info.extend_round_count || 0 > group_info.extend_round_count) return reject('INVALID_PARAMS');

      if(!_.isNumber(group_info.visitor_count)) return reject('INVALID_PARAMS');
      if(6 < group_info.visitor_count || 0 > group_info.visitor_count) return reject('INVALID_PARAMS');

      resolve(group_info);
    });
  }

  function p2(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p3)
      .then(p4.bind(null, group_info))
      .then(group_id => { resolve(group_id); })
      .catch(reject);
    });
  }

  function p3(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('通道号不存在');
      if(user.group_id) return reject('请先退出');
      resolve(user);
    });
  }

  function p4(group_info, user){
    return new Promise((resolve, reject) => {
      group_info.create_user_id = user.id;

      biz.group.clearFree()
      .then(biz.group.genFreeId)
      .then(p5.bind(null, group_info))
      .then(group_id => { resolve(group_id); })
      .catch(reject);
    });
  }

  function p5(group_info, group_id){
    return new Promise((resolve, reject) => {
      group_info.id = group_id;

      mysql.beginTransaction()
      .then(p6.bind(null, group_info))
      .then(() => { resolve(group_id); })
      .catch(reject);
    });
  }

  function p6(group_info, trans){
    return new Promise((resolve, reject) => {
      biz.group.saveNew(group_info, trans)
      .then(p7.bind(null, group_info, trans))
      .then(mysql.commitTransaction.bind(null, trans))
      .then(() => { resolve(); })
      .catch(err => {
        trans.rollback(() => { reject(err); });
      });
    });
  }

  function p7(group_info, trans){
    return biz.group_user.saveNew({
      group_id: group_info.id,
      user_id:  group_info.create_user_id,
      status:   0,
      seat:     1,
    }, trans);
  }

  /**
   *
   * @return
   */
  exports.search = function(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      p1(group_info)
      .then(p2.bind(null, server_id, channel_id))
      .then(biz.group_user.findAllByGroupId)
      .then(docs => { resolve(docs); })
      .catch(reject);
    });
  };
})();

(() => {
  function p1(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('通道号不存在');
      if(null === user.group_user_seat) return reject('用户不在任何群组');

      p2(user)
      .then(() => resolve(user.group_id))
      .catch(reject);
    });
  }

  function p2(user){
    if((0 < user.group_status) && (0 < user.group_user_seat)){
      return biz.group_user.editStatus(user.id, 2);
    }
    return biz.group_user.delByUserId(user.id);
  }

  /**
   *
   * @return
   */
  exports.quit = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1)
      .then(biz.group_user.findAllByGroupId)
      .then(docs => { resolve(docs); })
      .catch(reject);
    });
  };
})();

(() => {
  function p1(group){
    return new Promise((resolve, reject) => {
      if(!group) return reject('群组不存在');
      if(0 === group.group_user_count) return reject('游戏已经结束');
      // 玩家数+游客数
      var group_user_count = 4 + (group.visitor_count - 0);
      logger.debug('group user count: %s::%s', group.group_user_count, group_user_count);
      if(group.group_user_count >= group_user_count) return reject('群组满员');
      resolve();
    });
  }

  function p2(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('通道号不存在');
      if(null !== user.group_user_seat) return reject('必须先退出');
      resolve(user.id);
    });
  }

  function p3(group_id, user_id){
    return new Promise((resolve, reject) => {

    });
  }

  // function p2(server_id, channel_id, group_id){
  //   return new Promise((resolve, reject) => {
  //     biz.user.getByChannelId(server_id, channel_id)
  //     .then(p3)
  //     .then(() => resolve(group_id))
  //     .catch(reject);
  //   });
  // }

  // function p3(user){
  //   return new Promise((resolve, reject) => {
  //     if(!user) return reject('通道号不存在');
  //   });
  // }

  // function p3(group_id, user){
  //   return new Promise((resolve, reject) => {
  //     biz.group.getById(group_id)
  //     .then(p4)
  //     .then(biz.group_user.getByUserId.bind(null, user.id))
  //     .then(p5)
  //     .then(biz.group_user.saveNew.bind(null, {
  //       group_id: group_id,
  //       user_id: user.id,
  //     }))
  //     .then(biz.group_user.findAllByGroupId.bind(null, group_id))
  //     .then(docs => { resolve(docs); })
  //     .catch(reject);
  //   });
  // }

  // function p4(group){
  //   return new Promise((resolve, reject) => {
  //     if(!group) return reject('群组不存在');
  //     if(0 === group.group_user_count) return reject('游戏已经结束');
  //     // 玩家数+游客数
  //     var group_user_count = 4 + (group.visitor_count - 0);
  //     logger.debug('group user count: %s::%s', group.group_user_count, group_user_count);
  //     if(group.group_user_count >= group_user_count) return reject('群组满员');
  //     resolve();
  //   });
  // }

  // function p5(group_user){
  //   return new Promise((resolve, reject) => {
  //     if(group_user) return reject('必须先退出');
  //     resolve();
  //   });
  // }

  /**
   *
   * @return
   */
  exports.entry = function(server_id, channel_id, group_id){
    return new Promise((resolve, reject) => {
      biz.group.getById(group_id)
      .then(p1)
      .then(biz.user.getByChannelId.bind(null, server_id, channel_id))
      .then(p2)
      .then(p3.bind(null, group_id))
      .then(() => resolve(group_id))
      .then(biz.group_user.findAllByGroupId)
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              '(SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, '+
              '(SELECT SUM(seat) FROM g_group_user WHERE group_id=a.id) AS group_user_seat_sum, '+
              'a.* '+
            'FROM '+
              'g_group a '+
            'WHERE '+
              'a.id=?';
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
  function p1(cb, trans){
    var id = _.random(100000, 999999);
    biz.group.getById(id, trans)
    .then(group => {
      if(group) return p1(cb, trans);
      cb(null, id);
    })
    .catch(cb);
  }

  /**
   * 生成空闲Id
   *
   * @return
   */
  exports.genFreeId = function(trans){
    return new Promise((resolve, reject) => {
      p1((err, id) => {
        if(err) return reject(err);
        resolve(id);
      }, trans);
    });
  };
})();

(() => {
  var sql = 'DELETE '+
            'FROM '+
              'g_group '+
            'WHERE '+
              'id IN (SELECT b.id FROM (SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, a.* FROM g_group a WHERE a.status=0) b WHERE b.group_user_count=0)';
  /**
   *
   * @return
   */
  exports.clearFree = function(trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, null, err => {
        if(err) return reject(err);
        resolve();
      });
    });
  };
})();
