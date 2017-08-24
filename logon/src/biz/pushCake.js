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
  function p1(){
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  /**
   *
   * @return
   */
  exports.ready = function(server_id, channel_id){
    return new Promise((resolve, reject) => {
      p1()
      .then(biz.group_user.findAllByGroupId)
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();
