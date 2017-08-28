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
const _    = require('underscore');

const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const logger = require('log4js').getLogger('biz.pushCake');

(() => {
  function p1(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户不存在');
      if(!user.group_id) return reject('不在任何群组');
      if(0 < user.group_user_status) return reject('已经举过手了');
      if(0 === user.group_user_seat) return reject('你是钓鱼的');

      mysql.beginTransaction()
      .then(p2.bind(null, user))
      .then(() => resolve(user.group_id))
      .catch(reject);
    });
  }

  function p2(user, trans){
    return new Promise((resolve, reject) => {
      biz.group_user.ready(user.id, trans)
      .then(biz.group.getById.bind(null, user.group_id, trans))
      .then(p3.bind(null, trans))
      .then(mysql.commitTransaction.bind(null, trans))
      .then(() => resolve())
      .catch(p4.bind(null, reject, trans));
    });
  }

  function p3(trans, group){
    return new Promise((resolve, reject) => {
      if(0 < group.status) return reject('游戏已经开始');
      if(3 > group.group_user_seat_sum_ready) return resolve();
      biz.group.editReady(group.id, trans)
      .then(() => resolve())
      .catch(reject);
    });
  }

  function p4(reject, trans, err){
    trans.rollback(() => reject(err));
  }

  function p5(resolve, first, docs){
    var result = [];
    if(0 === docs.length) return resolve(result);
    result.push(docs);
    let data = [];
    data.push(docs);
    let group = docs[0];
    data.push(group);
    result.push(data);
    resolve(result);
    if(1 === group.group_status) p6(first, group);
  }

  /**
   *
   * @return
   */
  exports.ready = function(server_id, channel_id, first){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1)
      .then(biz.group_user.findAllByGroupId)
      .then(p5.bind(null, resolve, first))
      .catch(reject);
    });
  };

  function p6(first, group){
    setTimeout(() => {
      biz.group_craps.saveNew({
        group_id:    group.id,
        round_id:    group.extend_round_id,
        round_pno:   group.extend_curr_round_pno,
        round_no:    group.extend_curr_round_no,
        user_seat:   group.extend_curr_user_seat,
        is_auto:     0,
      })
      .then(p7)
      .catch(first);
    }, 3000);
  }

  function p7(){
    return new Promise((resolve, reject) => {
      resolve();
    });
  }
})();
