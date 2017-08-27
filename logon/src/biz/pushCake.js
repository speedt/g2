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
      if(3 > group.group_user_seat_sum_ready) return resolve();
      if(0 < group.status) return reject('游戏已经开始');
      biz.group.editReady(group.id, trans)
      .then(() => resolve())
      .catch(reject);
    });
  }

  function p4(reject, trans, err){
    trans.rollback(() => reject(err));
  }

  function p5(resolve, docs){
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
  exports.ready = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1)
      .then(biz.group_user.findAllByGroupId)
      .then(p5.bind(null, resolve))
      .catch(reject);
    });
  };
})();
