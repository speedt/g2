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
  function p1(trans, newInfo){
    return new Promise((resolve, reject) => {
      trans.query(sql, newInfo, (err, status) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  function p2(trans, group_user){
    return new Promise((resolve, reject) => {
      trans.commit(err => {
        if(err) return reject(err);
        resolve(group_user);
      });
    });
  }

  const sql = 'UPDATE g_group SET group_name=?, group_type=?, status=?, fund=?, round_count=?, visitor_count=? WHERE id=?';

  /**
   *
   * @param group 群组
   * @param user  创建人
   * @return
   */
  exports.editInfo = function(group, user, cb){

    mysql.getPool().getConnection((err, trans) => {
      if(err) return cb(err);

      trans.beginTransaction(err => {
        if(err) return cb(err);

        var postData = [
          group.group_name,
          group.group_type,
          group.status,
          group.fund,
          group.round_count,
          group.visitor_count,
          group.id,
        ];

        p1(trans, postData)
        .then(biz.group_user.saveNew.bind(null, {
          group_id: group.id,
          user_id: user.id,
          seat: 1
        }, trans))
        .then(p2.bind(null, trans))
        .then(group_user => { cb(null, group_user); })
        .catch(err => {
          trans.rollback(() => { cb(err); });
        })

      });
    });
  };
})();

(() => {
  function p1(trans, newInfo){
    return new Promise((resolve, reject) => {
      trans.query(sql, newInfo, (err, status) => {
        if(err) return reject(err);
        resolve();
      });
    });
  }

  function p2(trans, group){
    return biz.group_user.saveNew({
      group_id: group.id,
      user_id: group.user_id,
      seat: 1,
    }, trans);
  }

  function p3(trans, group_user){
    return new Promise((resolve, reject) => {
      trans.commit(err => {
        if(err) return reject(err);
        resolve(group_user);
      });
    });
  }

  const sql = 'INSERT INTO g_group (id, group_name, group_type, create_time, status, fund, round_count, visitor_count, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @param group 群组
   * @return
   */
  exports.saveNew = function(group, cb){

    mysql.getPool().getConnection((err, trans) => {
      if(err) return cb(err);

      trans.beginTransaction(err => {
        if(err) return cb(err);

        var postData = [
          group.id,
          group.group_name,
          group.group_type,
          group.create_time,
          group.status,
          group.fund,
          group.round_count,
          group.visitor_count,
          group.user_id,
        ];

        p1(trans, postData)
        .then(p2.bind(null, trans, group))
        .then(p3.bind(null, trans))
        .then(group_user => { cb(null, group_user); })
        .catch(err => {
          trans.rollback(() => { cb(err); });
        })

      });
    });
  };
})();

(() => {
  /**
   *
   * @param group 群组信息
   * @return
   */
  exports.search = function(group, user){
    return new Promise((resolve, reject) => {

      if(!_.isNumber(group.fund)) return reject('invalid_param');
      group.fund = group.fund || 0;
      if(0 > group.fund)          return reject('invalid_param');

      if(!_.isNumber(group.round_count)) return reject('invalid_param');
      group.round_count = group.round_count || 0;
      if(  cfg.dynamic.group_type_pushCake.round_count_max < group.round_count
        || cfg.dynamic.group_type_pushCake.round_count_min > group.round_count)
        return reject('invalid_param');

      if(!_.isNumber(group.visitor_count)) return reject('invalid_param');
      group.visitor_count = group.visitor_count || 0;
      if(  cfg.dynamic.group_type_pushCake.visitor_count_max < group.visitor_count
        || cfg.dynamic.group_type_pushCake.visitor_count_min > group.visitor_count)
        return reject('invalid_param');

      group.create_time = new Date();
      group.status = 0;

      p3(user.id)  /* 如果用户已在某一群组，则提示先退出 */
      .then(biz.group.getFree)
      .then(_group => {

        if(_group){
          return new Promise((resolve, reject) => {
            group.id = _group.id;

            biz.group.editInfo(group, user, (err, doc) => {
              if(err) return reject(err);
              resolve(doc);
            });
          });
        }

        return new Promise((resolve, reject) => {
          biz.group.genFreeId()
          .then(group_id => {
            return new Promise((resolve, reject) => {

              group.id = group_id;
              group.user_id = user.id;

              biz.group.saveNew(group, (err, doc) => {
                if(err) return reject(err);
                resolve(doc);
              });
            });
          })
          .then(doc => resolve(doc))
          .catch(reject);
        });
      })
      .then(group_user => {
        return new Promise((resolve, reject) => {
          resolve(group_user.group_id);
        });
      })
      .then(biz.group_user.findAllByGroupId)
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();

(() => {
  function p1(user){
    return new Promise((resolve, reject) => {
      if(0 === user.group_status){
        return biz.group_user.delByUserId(user.id, (err, status) => {
          if(err) return reject(err);
          resolve(user.group_id);
        });
      }

      biz.group_user.editOffline(user.id, (err, status) => {
        if(err) return reject(err);
        resolve(user.group_id);
      });
    });
  }

  /**
   *
   * @return
   */
  exports.quit = function(user){
    return new Promise((resolve, reject) => {

      if(!user.group_id) return reject('not_in_any_group');

      p1(user)
      .then(biz.group_user.findAllByGroupId)
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();

function p3(user_id){
  return new Promise((resolve, reject) => {
    biz.group_user.getByUserId(user_id, (err, doc) => {
      if(err) return reject(err);
      if(doc) return reject('must_be_quit');
      resolve();
    });
  });
};

(() => {
  function p1(group_id){
    return new Promise((resolve, reject) => {
      biz.group.getById(group_id, (err, doc) => {
        if(err) return reject(err);
        if(!doc) return reject('non_existent_group');
        resolve(doc);
      });
    });
  }

  function p2(group){
    return new Promise((resolve, reject) => {
      if(0 === group.user_count) return reject('game_is_over');
      // 玩家数+游客数
      var user_count = (cfg.dynamic.group_type_pushCake.player_count - 0) + group.visitor_count;
      logger.debug('group user count: %s::%s', group.user_count, user_count);
      if(group.user_count >= user_count) return reject('group_is_full');
      resolve();
    });
  };

  /**
   *
   * @return
   */
  exports.entry = function(group_id, user){
    return new Promise((resolve, reject) => {

      if(!_.isString(group_id)) return reject('invalid_group_id');
      group_id = _.trim(group_id);
      if('' === group_id) return reject('invalid_group_id');

      p3(user.id)  /* 如果用户已在某一群组，则提示先退出 */
      .then(p1.bind(null, group_id))  /* 判断群组是否存在 */
      .then(p2)  /* 判断群组是否满员 */
      .then(biz.group_user.saveNew.bind(null, {
        group_id: group_id,
        user_id: user.id,
      }))
      .then(biz.group_user.findAllByGroupId.bind(null, group_id))
      .then(docs => resolve(docs))
      .catch(reject);
    });
  };
})();

(() => {
  var sql = 'SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS user_count, a.* FROM g_group a WHERE a.id=?';

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

(() => {
  function p1(cb){
    var id = _.random(100000, 999999);

    biz.group.getById(id, (err, doc) => {
      if(err) return cb(err);
      if(doc) return p1(cb);
      cb(null, id);
    });
  }

  /**
   * 生成空闲Id
   *
   * @return
   */
  exports.genFreeId = function(){
    return new Promise((resolve, reject) => {
      p1((err, id) => {
        if(err) return reject(err);
        resolve(id);
      });
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              'b.* '+
            'FROM '+
              '(SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS user_count, a.* FROM g_group a) b '+
            'WHERE '+
              'b.user_count=0 '+
            'LIMIT 1';
  /**
   * 获取一个空闲的群组
   *
   * @return
   */
  exports.getFree = function(){
    return new Promise((resolve, reject) => {
      mysql.query(sql, null, (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();
