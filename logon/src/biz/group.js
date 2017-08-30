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

const roomPool = require('emag.model').roomPool;

const logger = require('log4js').getLogger('biz.group');

(() => {
  var sql = 'SELECT '+
              '(SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, '+
              '(SELECT SUM(seat) FROM g_group_user WHERE group_id=a.id) AS group_user_seat_sum, '+
              '(SELECT SUM(seat) FROM g_group_user WHERE group_id=a.id AND status>0) AS group_user_seat_sum_ready, '+
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
    .then(doc => {
      if(doc) return p1(cb, trans);
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
              'id IN (SELECT b.id FROM (SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, a.* FROM g_group a) b WHERE b.group_user_count=0)';
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

(() => {
  var sql = 'UPDATE g_group SET '+
              'status=?, '+
              'start_time=?, '+
              'round_id=?, '+
              'curr_round_pno=?, '+
              'curr_round_no=?, '+
              'curr_act=?, '+
              'curr_user_seat=? '+
            'WHERE id=?';
  /**
   * 用户状态
   *
   * 1、4人举手（游戏开始）
   *
   * @return
   */
  exports.editReady = function(id, trans){
    var group_info = {
      status:         1,
      start_time:     new Date(),  // 开始时间
      round_id:       utils.replaceAll(uuid.v4(), '-', ''),
      curr_round_pno: 1,  // 当前第n局
      curr_round_no:  1,  // 当前第n把
      curr_act:       1,  // 摇骰子
      curr_user_seat: 1,
      id:             id,
    };

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        group_info.status,
        group_info.start_time,
        group_info.round_id,
        group_info.curr_round_pno,
        group_info.curr_round_no,
        group_info.curr_act,
        group_info.curr_user_seat,
        group_info.id,
      ], err => {
        if(err) return reject(err);
        resolve(group_info);
      });
    });
  };
})();

(() => {
  const sql = 'INSERT INTO g_group (id, group_name, group_type, create_time, create_user_id, status, visitor_count, fund, round_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @return
   */
  exports.saveNew = function(group_info, trans){
    group_info.group_name = group_info.group_name || ('Room'+ group_info.id);
    group_info.create_time = new Date();
    group_info.status = 0;

    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        group_info.id,
        group_info.group_name,
        group_info.group_type,
        group_info.create_time,
        group_info.create_user_id,
        group_info.status,
        group_info.visitor_count,
        group_info.fund,
        group_info.round_count,
      ], err => {
        if(err) return reject(err);
        resolve(group_info);
      });
    });
  };
})();

(() => {
  var sql = 'UPDATE g_group SET curr_user_seat=? WHERE id=?';

  exports.editNextCraps = function(group_info, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [
        group_info.curr_user_seat,
        group_info.id,
      ], err => {
        if(err) return reject(err);
        resolve(group_info);
      });
    });
  };
})();






































(() => {
  function formVali(group_info){
    return new Promise((resolve, reject) => {
      if(!_.isNumber(group_info.visitor_count)) return reject('invalid_params');
      if(6 < group_info.visitor_count || 0 > group_info.visitor_count) return reject('invalid_params');

      if(!_.isNumber(group_info.fund)) return reject('invalid_params');
      if(999999 < group_info.fund || 0 > group_info.fund) return reject('invalid_params');

      if(!_.isNumber(group_info.round_count)) return reject('invalid_params');
      if(4 < group_info.round_count || 0 > group_info.round_count) return reject('invalid_params');

      resolve(group_info);
    });
  }

  function p1(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p2.bind(null, group_info))
      .then(() => resolve())
      .catch(reject);
    });
  }

  function p2(group_info, user){
    if(user.group_id) return Promise.reject('请先退出');

    return new Promise((resolve, reject) => {
      biz.user.createGroup(group_info, user)
      .then(() => resolve())
      .catch(reject);
    });
  }

  /**
   * 创建群组
   *
   * @return
   */
  exports.search = function(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      formVali(group_info)
      .then(p1.bind(null, server_id, channel_id))
      .then(biz.user.getByChannelId.bind(null, server_id, channel_id))
      .then(user => resolve(user))
      .catch(reject);
    });
  };
})();

(() => {
  function p1(user){
    if(!user.group_id) return Promise.reject('用户不在任何群组');

    return new Promise((resolve, reject) => {
      biz.user.clearFreeGroupById(user.group_id)
      .then(p2)
      .then(p3.bind(null, user))
      .then(() => resolve())
      .catch(reject);
    });
  }

  function p2(group_id){
    if(!group_id) return Promise.reject('用户不在任何群组');
    return Promise.resolve();
  }

  function p3(user){
    var room = roomPool.get(user.group_id);
    if(!room) return Promise.reject('房间不存在');

    if(room.quit(user.id)){
      return biz.user.quitGroup(user.id);
    }

    return Promise.resolve();
  }

  /**
   * 退出群组
   *
   * @return
   */
  exports.quit = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1)
      .then(biz.user.getByChannelId.bind(null, server_id, channel_id))
      .then(user => resolve(user))
      .catch(reject);
    });
  };
})();

(() => {
  function p1(group_id, user){
    if(user.group_id) return Promise.reject('请先退出');

    var room = roomPool.get(group_id);
    if(!room) return Promise.reject('房间不存在');

    room.entry(user);

    return Promise.resolve();
  }

  /**
   *
   * @return
   */
  exports.entry = function(server_id, channel_id, group_id){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1.bind(null, group_id))
      .then(biz.user.entryGroup)
      .then(biz.user.getByChannelId.bind(null, server_id, channel_id))
      .then(user => resolve(user))
      .catch(reject);
    });
  };
})();
