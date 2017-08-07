/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd = process.cwd();

const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');
const uuid = require('node-uuid');

const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const _ = require('underscore');

(() => {
  var sql = 'SELECT a.* FROM s_cfg a WHERE a.type_=? ORDER BY a.title ASC';

  exports.findByType = function(type, cb){

    mysql.query(sql, [type], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

/**
 *
 * @return
 */
exports.findAll = function(status, cb){

  var sql = 'SELECT a.* FROM s_cfg a';

  if(null !== status){
    sql += ' WHERE a.status=?';
  }

  sql += ' ORDER BY a.title ASC';

  mysql.query(sql, [status], (err, docs) => {
    if(err) return cb(err);
    cb(null, docs);
  });
};

(() => {
  var sql = 'UPDATE s_cfg SET value_=? WHERE key_=? AND type_=?';

  exports.editInfo = function(newInfo, cb){

    var postData = [
      newInfo.value_,
      newInfo.key_,
      newInfo.type_
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

/**
 *
 * @return
 */
exports.init = function(cb){

  this.findAll(null, function (err, docs){
    if(err) return cb(err);

    var info = {};

    for(let i of docs){
      info[i.type_ +'_'+ i.key_] = i.value_;
    }

    redis.select(conf.redis.database, function (err){
      if(err) return cb(err);

      redis.hmset('cfg', info, function (err, res){
        if(err) return cb(err);
        cb(null, res);
      });
    });
  });
};
