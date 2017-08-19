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
  function p1(trans, user_id){
    return new Promise((resolve, reject) => {
      biz.group_user.editStatus(user_id, 1, err => {
        if(err) return reject(err);
        resolve();
      }, trans);
    });
  }

  function p2(trans, group_id){
    return new Promise((resolve, reject) => {
      biz.group_user.getStatusCount(1, group_id, (err, doc) => {
        if(err) return reject(err);
        if(!doc) return reject(new Error('impossible'));

        if(cfg.dynamic.group_type_pushCake.player_count > doc.status_count) return resolve();

        biz.group.editStatus(group_id, 1, err => {
          if(err) return reject(err);
          resolve();
        }, trans);
      }, trans);
    });
  }

  function p3(trans){
    return new Promise((resolve, reject) => {
      trans.commit(err => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  function p4(user){
    return new Promise((resolve, reject) => {
      mysql.getPool().getConnection((err, trans) => {
        if(err) return reject(err);

        trans.beginTransaction(err => {
          if(err) return reject(err);

          p1(trans, user.id)
          .then(p2.bind(null, trans, user.group_id))
          .then(p3.bind(null, trans))
          .then(() => resolve())
          .catch(err => {
            trans.rollback(() => { reject(err); });
          });

        });
      });
    });
  }

  /**
   *
   */
  exports.ready = function(user){
    return new Promise((resolve, reject) => {
      if(!user.group_id) return reject('invalid_group_id');
      if(0 < user.group_status) return reject('game_already_begun');  // 游戏已经开始
      if(0 === user.seat) return reject('no_need_ready');             // 你是游客
      if(0 < user.group_user_status) return reject('already_begun');  // 你已经举手

      p4(user)
      .then(biz.group_user.findAllByGroupId.bind(null, user.group_id))
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();
