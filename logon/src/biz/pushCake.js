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

const roomPool = require('emag.model').roomPool;

const logger = require('log4js').getLogger('biz.pushCake');

(() => {
  function p1(user){
    if(!user.group_id) return Promise.reject('用户不在任何群组');

    var room = roomPool.get(user.group_id);
    if(!room) return Promise.reject('房间不存在');

    var ready_count = room.ready(user.id);

    if(!(3 < ready_count)) return Promise.resolve(user);

    return Promise.resolve(user);
  }

  /**
   *
   * @return
   */
  exports.ready = function(server_id, channel_id, next){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1)
      .then(user => resolve(user))
      .catch(reject);
    });
  };
})();

(() => {
  function p1(user){
    if(!user.group_id) return Promise.reject('用户不在任何群组');

    var room = roomPool.get(user.group_id);
    if(!room) return Promise.reject('房间不存在');

    if(1 !== room.act_status) return Promise.reject('不能摇骰子');

    var user = room.users[user.id];

    if(!user) return Promise.reject('你不在此房间');

    room.craps(user.id);

    return Promise.resolve(user);
  }

  /**
   *
   * @return
   */
  exports.craps = function(server_id, channel_id, next){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p1)
      .then(user => resolve(user))
      .catch(reject);
    });
  };
})();
