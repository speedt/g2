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

const md5 = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const cfg = require('emag.cfg');

const server = require('./server');

const _ = require('underscore');

const logger = require('log4js').getLogger('user');

(() => {
  var sql = 'SELECT b.user_name, c.goods_name, a.* FROM (SELECT * FROM s_user_purchase WHERE user_id=?) a LEFT JOIN s_user b ON (a.user_id=b.id) LEFT JOIN w_goods c ON (a.goods_id=c.id) WHERE b.id IS NOT NULL AND c.id IS NOT NULL ORDER BY a.create_time DESC';

  /**
   * 用户消费记录
   */
  exports.findPurchaseByUserId = function(user_id, cb){
    mysql.query(sql, [user_id], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.status=? ORDER BY a.create_time DESC';

  exports.findAll = function(status, cb){
    mysql.query(sql, [status], (err, docs) => {
      if(err) return cb(err);
      cb(null, docs);
    });
  };
})();

(() => {
  // var sql = 'SELECT (SELECT a.lv FROM s_user_vip a WHERE a.user_id=b.id AND NOW() BETWEEN a.create_time AND a.end_time ORDER BY a.lv DESC LIMIT 1) AS vip, b.* FROM s_user b WHERE b.user_name=?';

  var sql = 'SELECT b.* FROM s_user b WHERE b.user_name=?';

  /**
   *
   * @return
   */
  exports.findByName = function(user_name, cb){
    mysql.query(sql, [user_name], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();

(() => {
  var sql = 'SELECT a.* FROM s_user a WHERE a.id=?';

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
  var sql = 'SELECT a.* FROM s_user a WHERE a.device_code=?';

  /**
   * 没有则创建
   *
   * @return
   */
  exports.getByDeviceCode = function(device_code /* 设备号 */, cb){
    var self = this;

    mysql.query(sql, [device_code], (err, docs) => {
      if(err) return cb(err);
      if(mysql.checkOnly(docs)) return cb(null, docs[0]);

      var postData = {
        status: 1,
        device_code: device_code
      };

      self.saveDeviceCode(postData, (err, doc) => {
        if(err) return cb(err);
        cb(null, doc);
      });
    });
  };
})();

/**
 *
 * @params
 * @return
 */
(() => {

  // 2-10个字符，支持中文，英文大小写、数字、下划线
  var regex_user_name = /^[\u4E00-\u9FA5a-zA-Z0-9_]{2,10}$/;
  // 6-16个字符，支持英文大小写、数字、下划线，区分大小写
  var regex_user_pass = /^[a-zA-Z0-9_]{6,16}$/;

  function formVali(newInfo){
    newInfo.user_name = newInfo.user_name || '';
    newInfo.user_name = newInfo.user_name.trim();
    if(!regex_user_name.test(newInfo.user_name)) return '昵称不能为空';

    newInfo.user_pass = newInfo.user_pass || '';
    newInfo.user_pass = newInfo.user_pass.trim();
    if(!regex_user_name.test(newInfo.user_pass)) return '密码不能为空';
  }

  var sql = 'INSERT INTO s_user (id, user_name, user_pass, status, sex, create_time, mobile, qq, weixin, email, device_code, score, bullet_level, tool_1, tool_2, tool_3, tool_4, tool_5, tool_6, tool_7, tool_8, tool_9, nickname, diamond, vip, purchase_count) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  exports.register = function(newInfo, cb){

    var self = this;

    var warn = formVali(newInfo);

    if(warn) return cb(null, warn);

    self.findByName(newInfo.user_name, function (err, doc){
      if(err) return cb(err);
      if(doc) return cb(null, '昵称已经存在');

      // params
      var postData = [
        utils.replaceAll(uuid.v1(), '-', ''),
        newInfo.user_name,
        md5.hex(newInfo.user_pass),
        newInfo.status      || 1,
        newInfo.sex         || 1,
        new Date(),
        newInfo.mobile      || '',
        newInfo.qq          || '',
        newInfo.weixin      || '',
        newInfo.email       || '',
        newInfo.device_code || '',
        newInfo.score       || 0,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        newInfo.user_name || '',
        0,
        0,
        0
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, null, postData);
      });
    });
  };
})();

/**
 * 游客登陆
 *
 * @return
 */

/**
 *
 * @return
 * @code 101 用户名或密码输入错误
 * @code 102 禁止登陆
 * @code 103 用户名或密码输入错误
 */
exports.login = function(logInfo /* 用户名及密码 */, cb){
  var self = this;

  self.findByName(logInfo.user_name, (err, doc) => {
    if(err) return cb(err);
    if(!doc) return cb(null, '101');

    // 用户的状态
    if(1 !== doc.status) return cb(null, '102');

    // 验证密码
    if(md5.hex(logInfo.user_pass) !== doc.user_pass)
      return cb(null, '103');

    var p1 = new Promise((resolve, reject) => {
      self.authorize(doc, (err, code) => {
          if(err) return reject(err);
          resolve(code);
      });
    });

    var p2 = new Promise((resolve, reject) => {
      // 服务器可用性
      server.available((err, info) => {
        if(err) return reject(err);
        resolve(info);
      });
    });

    Promise.all([p1, p2]).then(values => {
      cb(null, null, values);
    }).catch(cb);

  });
};

(() => {
  const seconds = 5;  //令牌有效期 5s
  const numkeys = 4;
  const sha1 = '391dc0b72e8ac3029da5ee8bfd4b4dc3ad245840';
  const client_id = '5a2c6a1043454b168e6d3e8bef5cbce2';

  /**
   * 令牌授权
   *
   * @param user_id
   * @param client_id
   * @return 登陆令牌
   */
  exports.authorize = function(doc, cb){
    var code = utils.replaceAll(uuid.v4(), '-', '');

    delete doc.user_pass;

    redis.evalsha(sha1, numkeys,
      conf.redis.database, client_id, doc.id, code,
      seconds,
      JSON.stringify(doc),
      doc.score  || 0,
      doc.tool_1 || 0,
      doc.tool_2 || 0,
      doc.tool_3 || 0,
      doc.tool_4 || 0,
      doc.tool_5 || 0,
      doc.tool_6 || 0,
      doc.tool_7 || 0,
      doc.tool_8 || 0,
      doc.tool_9 || 0,
      doc.bullet_level || 1,
      doc.diamond      || 0,
      1,
      doc.bullet_consume_count || 0,
      doc.gain_score_count     || 0,
      doc.gift_count           || 0,
      doc.vip,
      doc.user_name,
      (err, code) => {
        if(err) return cb(err);
        cb(null, code);
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1 = '243ee192b64ae839b6d4d974f29d73b56f8526f2';

  /**
   * channel_close.lua
   */
  exports.logout = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    this.saveInfo(server_id, channel_id, function (err){
      if(err) return cb(err);

      redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, code) => {
        if(err) return cb(err);
        cb(null, code);
      });
    });
  };
})();

(() => {
  const numkeys = 3;
  const sha1 = '6df440fb93a747912f3eae2835c8fec8e90788ca';

  /**
   * my_info.lua
   */
  exports.myInfo = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    redis.evalsha(sha1, numkeys, conf.redis.database, server_id, channel_id, (err, doc) => {
        if(err) return cb(err);

        if(!_.isArray(doc)) return;

        cb(null, cfg.arrayToObject(doc));
    });
  };
})();

(() => {
  const numkeys = 2;
  const sha1 = '7a37ef6afacc93605536b75a22e566062570a61f';

  /**
   * user_info.lua
   *
   * @return
   */
  exports.userInfo = function(user_id, cb){

    redis.evalsha(sha1, numkeys, conf.redis.database, user_id, (err, code) => {
        if(err) return cb(err);
        cb(null, code);
    });
  };
})();

(() => {
  const sql = 'UPDATE s_user SET SCORE=?, BULLET_CONSUME_COUNT=?, GAIN_SCORE_COUNT=?, GIFT_COUNT=? WHERE id=?';

  /**
   *
   * 保存游戏分值等信息
   *
   * @return
   */
  exports.saveInfo = function(server_id, channel_id, cb){

    if(!server_id)  return;
    if(!channel_id) return;

    this.myInfo(server_id, channel_id, function (err, doc){
      if(err)              return cb(err);
      if(!_.isObject(doc)) return;
      if(!doc.id)          return;
      if(!doc.score)       return;

      var postData = [
        doc.score,
        doc.bullet_consume_count,
        doc.gain_score_count,
        doc.gift_count,
        doc.id
      ];

      mysql.query(sql, postData, function (err, status){
        if(err) return cb(err);
        cb(null, status);
      });
    });
  };
})();

(() => {
  const sql = 'UPDATE s_user SET NICKNAME=?, SCORE=?, GIFT_COUNT=? WHERE id=?';

  /**
   *
   * 修改用户基本信息
   *
   * @return
   */
  exports.saveBaseInfo = function(newInfo, cb){

    // newInfo.bullet_level = newInfo.bullet_level || 1;
    // newInfo.bullet_level = (1 > newInfo.bullet_level || 100 < newInfo.bullet_level) ? 1 : newInfo.bullet_level;

    var postData = [
      newInfo.nickname,
      newInfo.score,
      // newInfo.bullet_level,
      newInfo.gift_count,
      newInfo.id
    ];

    mysql.query(sql, postData, function (err, status){
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET STATUS=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.del = function(id, status, cb){
    mysql.query(sql, [status, id], (err, status) => {
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET USER_PASS=? WHERE id=?';

  /**
   *
   * @return
   */
  exports.resetPwd = function(id, user_pass, cb){
    mysql.query(sql, [md5.hex(user_pass), id], (err, status) => {
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user SET purchase_count=purchase_count+? WHERE id=?';

  /**
   * 更新用户消费信息
   *
   * @return
   */
  exports.updatePurchase = function(id, purchase_count, cb, conn){

    conn.query(sql, [purchase_count, id], (err, status) => {
      if(err) return cb(err);
      logger.debug('updatePurchase status: %j', status);
      cb(null, status);
    });
  };
})();

(() => {
  var sql = 'UPDATE s_user s INNER JOIN '+
              '(SELECT REPLACE(a.type_, "vip_", "") vip FROM s_cfg a '+
                'WHERE a.key_="upgrade_purchase" AND a.value_<=(SELECT purchase_count FROM s_user WHERE id=?) ORDER BY a.type_ DESC LIMIT 1) b '+
                  'SET s.vip=b.vip WHERE s.id=?';

  /**
   * 更新用户VIP
   *
   * @return
   */
  exports.updateVip = function(id, cb, conn){
    conn.query(sql, [id, id], (err, status) => {
      if(err) return cb(err);
      cb(null, status);
    });
  };
})();

// (() => {
//   var sql = 'SELECT a.* FROM s_user_vip a WHERE a.user_id=? AND NOW() BETWEEN a.create_time AND a.end_time ORDER BY a.lv DESC LIMIT 1';

//   /**
//    * 获取用户的VIP等级
//    *
//    * @return
//    */
//   exports.getUserVip = function(user_id, cb){
//     mysql.query(sql, [user_id], (err, docs) => {
//       if(err) return cb(err);
//       cb(null, mysql.checkOnly(docs) ? docs[0] : null);
//     });
//   };
// })();

(() => {
  var sql = 'SELECT a.* FROM s_user_bonus_login a WHERE a.flag=1 AND a.bonus>0 AND a.user_id=? AND DATE(a.create_time)=?';

  /**
   * 获取用户当天领过奖励的那条记录
   *
   * @return
   */
  exports.getUserTodayBonus = function(user_id, cb){
    mysql.query(sql, [user_id, utils.formatDate(new Date(), 'YYYY-MM-dd')], (err, docs) => {
      if(err) return cb(err);
      cb(null, mysql.checkOnly(docs) ? docs[0] : null);
    });
  };
})();

(() => {
  /**
   * 此次转盘获得的总价值
   *
   * @return
   */
  function wheelBonus(vip_level, grid_random){
    // 此格子的价值
    var grid_bonus  = cfg.sys['wheel_of_fortune_'+ grid_random] - 0;
    // 用户VIP的倍数
    var vip_grid    = cfg.sys['vip_'+ vip_level +'_wheel_of_fortune'] - 0;

    return grid_bonus * vip_grid;
  }

  /**
   * 随机一个格子
   *
   * @return
   */
  function wheelRandom(){
    // 转盘格子
    var grid_count  = 8;
    // 随机一个格子
    return _.random(1, grid_count);
  }

  const sql = 'INSERT INTO s_user_bonus_login (id, user_id, flag, create_time, wheel_cell, bonus) values (?, ?, ?, ?, ?, ?)';

  /**
   * 保存新登陆奖励
   *
   * @return
   */
  exports.saveNewLoginBonus = function(server_id, channel_id, cb){

    var self = this;

    self.myInfo(server_id, channel_id, function (err, doc){
      if(err)              return cb(err);
      if(!_.isObject(doc)) return;
      if(!doc.id)          return;

      var user_info = doc;

      self.getUserTodayBonus(user_info.id, function (err, doc){
        if(err) return cb(err);
        if(doc) return cb(null, user_info);

        var random = wheelRandom();
        // 此次转盘获得的总价值
        var bonus_count = wheelBonus(user_info.vip, random);

        var p1 = new Promise((resolve, reject) => {
          var postData = [
            utils.replaceAll(uuid.v1(), '-', ''),
            user_info.id,
            1,
            new Date(),
            random,
            bonus_count,
          ];

          mysql.query(sql, postData, function (err, status){
            if(err) return reject(err);
            resolve();
          });
        });

        var p2 = new Promise((resolve, reject) => {
          self.updateUserMoney(user_info.id, bonus_count, function (err, code){
            if(err) return reject(err);
            if('OK' !== code) return reject(new Error('Not Found'));
            resolve();
          });
        });

        Promise.all([p1, p2]).then(values => {
          user_info.wheel_of_fortune_cell  = random;
          user_info.wheel_of_fortune_bonus = bonus_count;
          cb(null, user_info);
        }).catch(cb);

      });

    });
  };
})();

(() => {
  const numkeys = 2;
  const sha1 = 'e55cbe245cd29ba21c3ce357bdc43004eed76381';

  /**
   * user_info_vip.lua
   *
   * @return
   */
  exports.updateUserVip = function(user_id, cb){

    this.getById(user_id, function (err, doc){
      if(err) return cb(err);

      redis.evalsha(sha1, numkeys, conf.redis.database, user_id, doc.vip, (err, code) => {
          if(err) return cb(err);
          cb(null, code);
      });
    })

  };
})();

(() => {
  const numkeys = 2;
  const sha1 = '9ed0f642d1fafd1ce31f912f39eaaa63df77891a';

  /**
   * user_info_money.lua
   *
   * @return
   */
  exports.updateUserMoney = function(user_id, score, cb){

    redis.evalsha(sha1, numkeys, conf.redis.database, user_id, score, (err, code) => {
        if(err) return cb(err);
        cb(null, code);
    });
  };
})();


(() => {
  var sql  = 'SELECT b.game_currency, a.id FROM s_user_purchase a, w_goods b WHERE a.status=0 AND a.user_id=? AND a.goods_id=b.id';
  var sql2 = 'UPDATE s_user_purchase SET status=1 WHERE id=?';

  /**
   * 更新用户购买记录
   *
   * @return
   */
  exports.updateUserPurchase = function(server_id, channel_id, cb){

    var self = this;

    self.myInfo(server_id, channel_id, function (err, doc){
      if(err)              return cb(err);
      if(!_.isObject(doc)) return;
      if(!doc.id)          return;
      if(!doc.score)       return;

      var user_id = doc.id;

      mysql.query(sql, [user_id], (err, docs) => {
        if(err) return cb(err);

        if(0 === docs.length) return cb(null);

        var count = 0;

        for(let i of docs){

          count += i.game_currency;

          mysql.query(sql2, [i.id], function (err, status){

          });
        }

        self.updateUserMoney(user_id, count, function (err){
          if(err) return cb(err);
          cb(null, { user_id: user_id, score: count });
        });

      });
    });

  };
})();
