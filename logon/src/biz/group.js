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

const logger = require('log4js').getLogger('biz.group');

(() => {
  var sql = '';

  /**
   *
   * @return
   */
  exports.search = function(cb){
    // todo
  };
})();

(() => {
  var sql = '';

  /**
   *
   * @return
   */
  exports.quit = function(cb){
    // todo
  };
})();

(() => {

  function step1(user_id){

    return new Promise((resolve, reject) => {

      biz.group_user.getByUserId(user_id, (err, doc) => {
        if(err) return reject(err);
        if(doc) return reject('must_be_quit');
        resolve();
      });
    });
  }

  function step2(group_id){

    var self = this;

    return new Promise((resolve, reject) => {

      self.getById(group_id, (err, doc) => {
        if(err) return reject(err);
        if(!doc) return reject('non_existent_group');
        resolve();
      });
    });
  }

  /**
   *
   * @return
   */
  exports.entry = function(group_id, user_id, cb){

    var self = this;
  };
})();

(() => {
  var sql = 'SELECT a.* FROM g_group a WHERE a.id=?';

  /**
   *
   * @return
   */
  exports.getById = function(id, cb){

    mysql.query(sql, [id], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();
