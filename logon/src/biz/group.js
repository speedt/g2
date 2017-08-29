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
      .then(p3)
      .then(group_id => resolve(group_id))
      .catch(reject);
    });
  }

  function p2(group_info, user){
    return new Promise((resolve, reject) => {
      if(_.isNumber(user.group_user_seat)) return reject('已经在某个群组中');

      group_info.create_user_id = user.id;
      resolve(group_info);
    });
  }

  function p3(group_info){
    return new Promise((resolve, reject) => {
      biz.group.clearFree()
      .then(biz.group.genFreeId)
      .then(p4.bind(null, group_info))
      .then(group_id => resolve(group_id))
      .catch(reject);
    });
  }

  function p4(group_info, group_id){
    group_info.id = group_id;

    return new Promise((resolve, reject) => {
      mysql.beginTransaction()
      .then(p5.bind(null, group_info))
      .then(() => resolve(group_id))
      .catch(reject);
    });
  }

  function p5(group_info, trans){
    return new Promise((resolve, reject) => {
      biz.group.saveNew(group_info, trans)
      .then(biz.group_user.saveNew.bind(null, {
        group_id: group_info.id,
        user_id:  group_info.create_user_id,
        seat:     1,
      }, trans))
      .then(mysql.commitTransaction.bind(null, trans))
      .then(() => resolve())
      .catch(p6.bind(null, reject, trans));
    });
  }

  function p6(reject, trans, err){
    trans.rollback(() => reject(err));
  }

  function p7(resolve, docs){
    var result = [];
    if(0 === docs.length) return resolve(result);
    result.push(docs);
    let data = [];
    data.push(docs);
    data.push(docs[0]);
    result.push(data);
    resolve(result);
  }

  /**
   *
   * @return
   */
  exports.search = function(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      formVali(group_info)
      .then(p1.bind(null, server_id, channel_id))
      .then(biz.group_user.findAllByGroupId)
      .then(p7.bind(null, resolve))
      .catch(reject);
    });
  };
})();

(() => {
  function p1(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户不存在');
      if(!_.isNumber(user.group_user_seat)) return reject('用户不在任何群组');

      p2(user)
      .then(() => resolve(user.group_id))
      .catch(reject);
    });
  }

  function p2(user){
    if((0 < user.group_status) && (0 < user.group_user_seat))
      return biz.group_user.forcedSignOut(user.id);
    return biz.group_user.delByUserId(user.id);
  }

  function p3(resolve, docs){
    var result = [];
    if(0 === docs.length) return resolve(result);
    result.push(docs);
    let data = [];
    data.push(docs);
    data.push(docs[0]);
    result.push(data);
    resolve(result);
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
      .then(p3.bind(null, resolve))
      .catch(reject);
    });
  };
})();

(() => {
  function p1(group){
    return new Promise((resolve, reject) => {
      if(!group) return reject('群组不存在');
      if(0 === group.group_user_count) return reject('群组关闭');
      // 玩家数+游客数
      var group_user_count = 4 + (group.visitor_count - 0);
      logger.debug('group user count: %s::%s', group.group_user_count, group_user_count);
      if(group.group_user_count >= group_user_count) return reject('群组满员');

      resolve({
        group_id: group.id,
        seat:     biz.group_user.getSeatNum(group.group_user_seat_sum),
      });
    });
  }

  function p2(server_id, channel_id, group_user_info){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p3.bind(null, group_user_info))
      .then(biz.group_user.saveNew)
      .then(() => resolve(group_user_info.group_id))
      .catch(reject);
    });
  }

  function p3(group_user_info, user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户不存在');
      if(_.isNumber(user.group_user_seat)) return reject('已经在某个群组中');
      group_user_info.user_id = user.id;
      resolve(group_user_info);
    });
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

  /**
   *
   * @return
   */
  exports.entry = function(server_id, channel_id, group_id){
    return new Promise((resolve, reject) => {
      biz.group.getById(group_id)
      .then(p1)
      .then(p2.bind(null, server_id, channel_id))
      .then(biz.group_user.findAllByGroupId)
      .then(p4.bind(null, resolve))
      .catch(reject);
    });
  };
})();

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
