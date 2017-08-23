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
  // function p1(trans, newInfo){
  //   return new Promise((resolve, reject) => {
  //     trans.query(sql, newInfo, (err, status) => {
  //       if(err) return reject(err);
  //       resolve();
  //     });
  //   });
  // }

  // function p2(trans, group_user){
  //   return new Promise((resolve, reject) => {
  //     trans.commit(err => {
  //       if(err) return reject(err);
  //       resolve(group_user);
  //     });
  //   });
  // }

  const sql = 'UPDATE g_group SET group_name=?, group_type=?, status=?, status_time=?, extend_fund=?, extend_round_count=?, visitor_count=? WHERE id=?';

  exports.editInfo = function(group_info, trans){
    return new Promise((resolve, reject) => {
      group_info.group_name = group_info.group_name || ('房间'+ group_info.id);
      group_info.status_time = new Date();

      (trans || mysql).query(sql, [
        group_info.group_name,
        group_info.group_type,
        group_info.status,
        group_info.status_time,
        group_info.extend_fund,
        group_info.extend_round_count,
        group_info.visitor_count,
        group_info.id,
      ], err => {
        if(err) return reject(err);
        resolve(group_info);
      });
    });
  };


  // /**
  //  *
  //  * @param group 群组
  //  * @param user  创建人
  //  * @return
  //  */
  // exports.editInfo = function(group, user, cb){

  //   mysql.getPool().getConnection((err, trans) => {
  //     if(err) return cb(err);

  //     trans.beginTransaction(err => {
  //       if(err) return cb(err);

  //       var postData = [
  //         group.group_name,
  //         group.group_type,
  //         group.status,
  //         group.status_time,
  //         group.fund,
  //         group.round_count,
  //         group.visitor_count,
  //         group.id,
  //       ];

  //       p1(trans, postData)
  //       .then(biz.group_user.saveNew.bind(null, {
  //         group_id: group.id,
  //         user_id: user.id,
  //         seat: 1
  //       }, trans))
  //       .then(p2.bind(null, trans))
  //       .then(group_user => { cb(null, group_user); })
  //       .catch(err => {
  //         trans.rollback(() => { cb(err); });
  //       })

  //     });
  //   });
  // };
})();

(() => {
  // function p1(group_info, trans, group_id){
  //   return new Promise((resolve, reject) => {
  //     group_info.id = group_id;
  //     group_info.group_name = group_info.group_name || ('房间'+ group_info.id);
  //     group_info.create_time = new Date();
  //     group_info.status = 0;

  //     (trans || mysql).query(sql, [
  //       group_info.id,
  //       group_info.group_name,
  //       group_info.group_type,
  //       group_info.create_time,
  //       group_info.create_user_id,
  //       group_info.status,
  //       group_info.visitor_count,
  //       group_info.extend_fund,
  //       group_info.extend_round_count,
  //     ], err => {
  //       if(err) return reject(err);
  //       resolve(group_info);
  //     });
  //   });
  // }

  const sql = 'INSERT INTO g_group (id, group_name, group_type, create_time, create_user_id, status, visitor_count, extend_fund, extend_round_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  /**
   *
   * @param group 群组
   * @return
   */
  exports.saveNew = function(group_info, trans){
    return new Promise((resolve, reject) => {
      group_info.group_name = group_info.group_name || ('房间'+ group_info.id);
      group_info.create_time = new Date();
      group_info.status = 0;

      (trans || mysql).query(sql, [
        group_info.id,
        group_info.group_name,
        group_info.group_type,
        group_info.create_time,
        group_info.create_user_id,
        group_info.status,
        group_info.visitor_count,
        group_info.extend_fund,
        group_info.extend_round_count,
      ], err => {
        if(err) return reject(err);
        resolve(group_info);
      });
    });
  };

  // exports.saveNew = function(group_info, trans){
  //   return new Promise((resolve, reject) => {
  //     biz.group.genFreeId(trans)
  //     .then(p1.bind(null, group_info, trans))
  //     .then(doc => { resolve(doc); })
  //     .catch(reject);
  //   });
  // };
})();

(() => {
  function p1(group_info){
    return new Promise((resolve, reject) => {
      if(!_.isNumber(group_info.extend_fund)) return reject('INVALID_PARAMS');
      if(999999 < group_info.extend_fund || 0 > group_info.extend_fund) return reject('INVALID_PARAMS');

      if(!_.isNumber(group_info.extend_round_count)) return reject('INVALID_PARAMS');
      if(4 < group_info.extend_round_count || 0 > group_info.extend_round_count) return reject('INVALID_PARAMS');

      if(!_.isNumber(group_info.visitor_count)) return reject('INVALID_PARAMS');
      if(6 < group_info.visitor_count || 0 > group_info.visitor_count) return reject('INVALID_PARAMS');

      resolve(group_info);
    });
  }

  function p2(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      biz.user.getByChannelId(server_id, channel_id)
      .then(p3)
      .then(p4.bind(null, group_info))
      .then(group_id => { resolve(group_id); })
      .catch(reject);
    });
  }

  function p3(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('通道号不存在');
      if(user.group_id) return reject('请先退出');
      resolve(user);
    });
  }

  function p4(group_info, user){
    return new Promise((resolve, reject) => {
      group_info.create_user_id = user.id;

      biz.group.genFreeId()
      .then(p5.bind(null, group_info))
      .then(group_id => { resolve(group_id); })
      .catch(reject);
    });
  }

  function p5(group_info, group_id){
    return new Promise((resolve, reject) => {
      group_info.id = group_id;

      // p6()
      // .then(p7)

      mysql.beginTransaction()
      .then(p8.bind(null, group_info))
      .then(group_id => { resolve(group_id); })
      .catch(reject);
    });
  }

  // function p6(){
  //   return new Promise((resolve, reject) => {
  //     mysql.getPool().getConnection((err, trans) => {
  //       if(err) return reject(err);
  //       resolve(trans);
  //     });
  //   });
  // }

  // function p7(trans){
  //   return new Promise((resolve, reject) => {
  //     trans.beginTransaction(err => {
  //       if(err) return reject(err);
  //       resolve(trans);
  //     });
  //   });
  // }

  function p8(group_info, trans){
    return new Promise((resolve, reject) => {

      var group_user_info = {
        group_id: group_info.id,
        user_id:  group_info.create_user_id,
        status:   0,
        seat:     1,
      };

      biz.group.saveNew(group_info, trans)
      .then(biz.group_user.saveNew.bind(null, group_user_info, trans))
      // .then(p9.bind(null, trans))

      .then(mysql.commitTransaction.bind(null, trans))


      .then(() => { resolve(group_info.id); })
      .catch(err => {
        trans.rollback(() => { reject(err); });
      });
    });
  }

  // function p9(trans){
  //   return new Promise((resolve, reject) => {
  //     trans.commit(err => {
  //       if(err) return reject(err);
  //       resolve();
  //     });
  //   });
  // }

  /**
   *
   * @return
   */
  exports.search = function(server_id, channel_id, group_info){
    return new Promise((resolve, reject) => {
      p1(group_info)
      .then(p2.bind(null, server_id, channel_id))
      .then(biz.group_user.findAllByGroupId)
      .then(docs => { resolve(docs); })
      .catch(reject);
    });
  };
})();

(() => {
  function p1(user){
    return new Promise((resolve, reject) => {
      if(!user) return reject('用户不存在');
      if(!user.group_id) return reject('用户不在任何群组');

      if(0 === user.group_status || 0 === user.seat){
        return biz.group_user.delByUserId(user.id, err => {
          if(err) return reject(err);
          resolve(user.group_id);
        });
      }

      biz.group_user.editStatus(user.id, 2, err => {
        if(err) return reject(err);
        resolve(user.group_id);
      });
    });
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
      .then(docs => { resolve(docs); })
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
   * 1、参数验证
   * 2、验证群组是否存在
   * 3、验证群组游戏是否已经结束
   * 4、验证群组是否已经满员
   * 5、验证用户是否已经在某一个群组内
   * 6、保存用户在群组内的信息
   * 7、群发群组内所有用户的信息
   *
   * @return
   */
  exports.entry = function(server_id, channel_id, group_id){
    return new Promise((resolve, reject) => {
      p1(group_id)
      .then(p2.bind(null, server_id, channel_id))
      .then(docs => { resolve(docs); })
      .catch(reject);
    });
  };
})();

(() => {
  var sql = 'SELECT '+
              '(SELECT COUNT(1) FROM g_group_user WHERE group_id=a.id) AS group_user_count, '+
              '(SELECT SUM(seat) FROM g_group_user WHERE group_id=a.id) AS group_user_seat_sum, '+
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
    .then(group => {
      if(group) return p1(cb, trans);
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
