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
  var sql = 'UPDATE g_group SET status=?, status_time=? WHERE id=?';

  /**
   * 用户状态
   *
   * 0、默认
   * 1、4人举手（游戏开始）
   *
   * @return
   */
  exports.editStatus = function(id, status, trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [status, new Date(), id], err => {
        if(err) return reject(err);
        resolve();
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

  function p2(trans, group_user){
    return new Promise((resolve, reject) => {
      trans.commit(err => {
        if(err) return reject(err);
        resolve(group_user);
      });
    });
  }

  const sql = 'UPDATE g_group SET group_name=?, group_type=?, status=?, status_time=?, fund=?, round_count=?, visitor_count=? WHERE id=?';

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
          group.status_time,
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

  const sql = 'INSERT INTO g_group (id, group_name, group_type, create_time, create_user_id, status, visitor_count, extend_fund, extend_round_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @param group 群组
   * @return
   */
  exports.saveNew = function(group, cb){


    return new Promise((resolve, reject) => {


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
          });

        });
      });


    });

  };
})();

(() => {
  function p1(group){
    return new Promise((resolve, reject) => {

      if(!_.isNumber(group.extend_fund)) return reject('invalid_params');
      if(999999 < group.extend_fund || 0 > group.extend_fund)
        return reject('invalid_params');

      if(!_.isNumber(group.extend_round_count)) return reject('invalid_params');
      if(4 < group.extend_round_count || 0 > group.extend_round_count)
        return reject('invalid_params');

      if(!_.isNumber(group.visitor_count)) return reject('invalid_params');
      if(6 < group.visitor_count || 0 > group.visitor_count)
        return reject('invalid_params');

      resolve(group);
    });
  }

  /**
   *
   * @param group 群组信息
   * @return
   */
  exports.search = function(group, user){
    return new Promise((resolve, reject) => {

      if(!_.isNumber(group.extend_fund)) return reject('invalid_param');
      group.fund = group.fund || 0;
      if(0 > group.fund)          return reject('invalid_param');

      if(!_.isNumber(group.extend_round_count)) return reject('invalid_param');
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
      if(0 === user.group_status || 0 === user.seat){
        return biz.group_user.delByUserId(user.id, (err, status) => {
          if(err) return reject(err);
          resolve(user.group_id);
        });
      }

      biz.group_user.editStatus(user.id, 2, (err, status) => {
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

// function p3(user_id){
//   return new Promise((resolve, reject) => {
//     biz.group_user.getByUserId(user_id, (err, doc) => {
//       if(err) return reject(err);
//       if(doc) return reject('must_be_quit');
//       resolve();
//     });
//   });
// };

(() => {

  // function p2_1(group_user){
  //   return new Promise((resolve, reject) => {
  //     if(group_user) return reject('必须先退出');
  //     resolve();
  //   });
  // }

  // function p2_2(group){
  //   return new Promise((resolve, reject) => {
  //     if(!group) return reject('群组不存在');
  //     if(0 === group.group_user_count) return reject('游戏已经结束');
  //     // 玩家数+游客数
  //     var group_user_count = 4 + (group.visitor_count - 0);
  //     logger.debug('group user count: %s::%s', group.group_user_count, group_user_count);
  //     if(group.group_user_count >= group_user_count) return reject('群组满员');
  //     resolve();
  //   });
  // }

  // function p2(user, group_id){
  //   return new Promise((resolve, reject) => {
  //     biz.group_user.getByUserId(user.id)
  //     .then(p2_1)
  //     .then(biz.group.getById.bind(null, group_id))
  //     .then(p2_2)
  //     .then(biz.group_user.saveNew.bind(null, {
  //       group_id: group_id,
  //       user_id: user.id,
  //     }))
  //     .then(biz.group_user.findAllByGroupId.bind(null, group_id))
  //     .then(docs => { resolve(docs); })
  //     .catch(reject);
  //   });
  // }

  // function p1(group_id){
  //   return new Promise((resolve, reject) => {
  //     biz.group.getById(group_id, (err, doc) => {
  //       if(err) return reject(err);
  //       if(!doc) return reject('non_existent_group');
  //       resolve(doc);
  //     });
  //   });
  // }

  // function p2(group){
  //   return new Promise((resolve, reject) => {
  //     if(0 === group.user_count) return reject('game_is_over');
  //     // 玩家数+游客数
  //     var user_count = (cfg.dynamic.group_type_pushCake.player_count - 0) + group.visitor_count;
  //     logger.debug('group user count: %s::%s', group.user_count, user_count);
  //     if(group.user_count >= user_count) return reject('group_is_full');
  //     resolve();
  //   });
  // };

  function p1(group_id){
    return new Promise((resolve, reject) => {
      if(!_.isString(group_id)) return reject('INVALID_PARAMS');
      group_id = _.trim(group_id);
      if('' === group_id) return reject('INVALID_PARAMS');
      resolve(group_id);
    });
  }

  function p2(server_id, channel_id, group_id){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p3.bind(null, group_id))
      .then(docs => { resolve(docs); })
      .catch(reject);
    });
  }

  function p3(group_id, user){
    return new Promise((resolve, reject) => {
      biz.group.getById(group_id)
      .then(p4)
      .then(biz.group_user.getByUserId.bind(null, user.id))
      .then(p5)
      .then(biz.group_user.saveNew.bind(null, {
        group_id: group_id,
        user_id: user.id,
      }))
      .then(biz.group_user.findAllByGroupId.bind(null, group_id))
      .then(docs => { resolve(docs); })
      .catch(reject);
    });
  }

  function p4(group){
    return new Promise((resolve, reject) => {
      if(!group) return reject('群组不存在');
      if(0 === group.group_user_count) return reject('游戏已经结束');
      // 玩家数+游客数
      var group_user_count = 4 + (group.visitor_count - 0);
      logger.debug('group user count: %s::%s', group.group_user_count, group_user_count);
      if(group.group_user_count >= group_user_count) return reject('群组满员');
      resolve();
    });
  }

  function p5(group_user){
    return new Promise((resolve, reject) => {
      if(group_user) return reject('必须先退出');
      resolve();
    });
  }

  /**
   *
   * @return
   */
  exports.entry = function(server_id, channel_id, group_id){
    return new Promise((resolve, reject) => {

      p1(group_id)
      .then(p2.bind(null, server_id, channel_id))
      .then(docs => { resolve(docs); })
      .catch(reject);


      // biz.user.getByChannelId(server_id, channel_id)
      // .then(p1.bind(null, group_id))
      // .then(docs => { resolve(docs); })
      // .catch(reject);


      // p1(group_id)
      // .then(p2.bind(null, user));
      // .catch(reject);



      // biz.group_user.getByUserId(user.id)
      // .then(p1.bind(null, group_id))
      // .then(p2)
      // .catch(reject);


      // p3(user.id)  /* 如果用户已在某一群组，则提示先退出 */
      // .then(p1.bind(null, group_id))  /* 判断群组是否存在 */
      // .then(p2)  /* 判断群组是否满员 */
      // .then(biz.group_user.saveNew.bind(null, {
      //   group_id: group_id,
      //   user_id: user.id,
      // }))
      // .then(biz.group_user.findAllByGroupId.bind(null, group_id))
      // .then(docs => resolve(docs))
      // .catch(reject);
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              '(SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, '+
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
  function p1(cb){
    var id = _.random(100000, 999999);
    biz.group.getById(id)
    .then(group => {
      if(group) return p1(cb);
      cb(null, id);
    })
    .catch(cb);
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
              '(SELECT (SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, a.* FROM g_group a) b '+
            'WHERE '+
              'b.group_user_count=? '+
            'LIMIT 1';
  /**
   * 获取一个空闲的群组
   *
   * @return
   */
  exports.getFree = function(trans){
    return new Promise((resolve, reject) => {
      (trans || mysql).query(sql, [0], (err, docs) => {
        if(err) return reject(err);
        resolve(mysql.checkOnly(docs) ? docs[0] : null);
      });
    });
  };
})();
