/*!
 * emag.model
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const uuid = require('node-uuid');

const utils = require('speedt-utils').utils;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const _  = require('underscore');
_.str    = require('underscore.string');
_.mixin(_.str.exports());

const logger = require('log4js').getLogger('model.room');

module.exports = function(opts){
  return new Method(opts);
}

var Method = function(opts){
  var self                      = this;
  self.opts                     = opts || {};
  self.seat_no                  = { 1: 1, 2: 2, 4: 3, 8: 4 };  // 座位号对应关系
  self.id                       = opts.id;
  self.name                     = opts.name          || ('Room '+ opts.id);
  self.fund                     = opts.fund          || 1000;  // 组局基金
  self.round_count              = opts.round_count   || 6;     // 圈数
  self.visitor_count            = opts.visitor_count || 6;     // 游客人数
  self.round_id                 = utils.replaceAll(uuid.v4(), '-', '');
  self.players                  = {};
  self.users                    = {};
  self.ready_count              = 0;  // 举手人数
  self.create_time              = new Date().getTime();
  self.round_pno                = 1;  // 当前第n局
  self.round_no                 = 1;  // 当前第n把
  self.round_no_first_user_seat = 1;  // 当前第一个起牌的人
  self.user_seat                = 1;  // 当前准备行动的座位
  self.craps_result             = {}; // 骰子 { 1: [1, 2], 2: [3, 4]}
  self.act_status               = 0;  // 0默认 1摇骰子 2庄家设置锅底 3确定庄家，等庄在摇骰子
  self.user_seat_banker         = 1;  // 当前庄家座位
  self.user_seat_banker_craps   = []; // 庄家摇骰子结果
};

var pro = Method.prototype;

/**
 * 庄家下注
 *
 * @return
 */
pro.bankerBet = function(){
  // TODO
};

(() => {
  function firstSeat(){
    var self = this;
    var n = (self.user_seat_banker_craps - 0) + (self.user_seat_banker_craps - 0);
    var m = (n - 0 - 1 + self.seat_no[self.user_seat_banker]) % 4;
    return (0 === m) ? 4 : m;
  }

  /**
   * 庄家摇骰子
   *
   * @return
   */
  pro.crapsBanker = function(user_id){
    var self = this;

    if(2 !== self.act_status) return;  // 庄家摇骰子

    var user = self.users[user_id];
    if(!user) return;  // 用户不存在，不能摇骰子
    if(self.user_seat_banker !== user.seat) return;  // 你不是庄

    self.user_seat_banker_craps = [
      _.random(1, 6),
      _.random(1, 6),
    ];

    self.round_no_first_user_seat = firstSeat.call(self);

    self.act_status = 3;
  };
})();

(() => {
  function maxCraps(){
    var self = this;

    var max  = 0;
    var seat = 0;

    for(let i in self.craps_result){
      let m = (self.craps_result[i][0] - 0) + (self.craps_result[i][1] - 0);
      if(11 < m) return i;

      if(max <= m){
        max = m;
        seat = i;
      }
    }

    return seat;
  }

  /**
   * 4人摇骰子
   *
   * @return
   */
  pro.craps = function(user_id){
    var self = this;

    var user = self.users[user_id];
    if(!user) return;  // 用户不存在，不能摇骰子
    if(0 === user.seat) return;  // 你是游客

    var craps_result = self.craps_result[user.seat];

    // 摇过骰子则返回
    if(craps_result) return craps_result;

    craps_result = self.craps_result[user.seat] = [
      _.random(1, 6),
      _.random(1, 6),
    ];

    // 如果摇骰子的人为4人
    if(3 < _.size(self.craps_result)){
      // 最大的骰子，并设置庄家位置
      self.user_seat_banker = maxCraps.call(self);
      self.act_status = 2;
      self.craps_result = [];  // 重置骰子
    }

    return craps_result;
  };
})();

/**
 *
 * @return
 */
pro.release = function(){
  var self = this;

  if(3 < self.ready_count) return false;

  for(let i of _.keys(self.players)){
    delete self.players[i];
  }

  for(let i of _.keys(self.users)){
    delete self.users[i];
  }

  return true;
};

/**
 *
 * @return
 */
pro.entry = function(user){
  if(!user) return Promise.reject('invalid_params');
  if(!user.id) return Promise.reject('invalid_params');

  var self = this;

  if(self.users[user.id]) return Promise.reject('已经进入该房间');
  if((self.visitor_count - 0 + 3) < _.size(self.users)) return Promise.reject('房间满员');

  user.seat = getSeatNum.call(self);

  self.users[user.id] = user;

  if(0 < user.seat){
    self.players[user.seat] = user.id;
  }

  return Promise.resolve(user);
};

/**
 *
 * @return
 */
pro.reEntry = function(user){
  var _user = this.users[user.id];

  if(!_user) return;

  _user.server_id = user.server_id;
  _user.channel_id = user.channel_id;

  if(0 < _user.seat) _user.is_quit = 0;
}

/**
 *
 * @return
 */
pro.quit = function(user_id){
  var self = this;

  var user = self.users[user_id];
  if(!user) return true;

  if((3 < self.ready_count) && (0 < user.seat)){
    user.is_quit = 1;
    user.quit_time = new Date().getTime();
    return false;
  }

  if(0 < user.seat){
    if(1 === user.ready_status) self.ready_count--;
    delete self.players[user.seat];
  }

  delete self.users[user_id];
  return true;
};

/**
 *
 * @return
 */
pro.ready = function(user_id){
  var self = this;

  if(3 < self.ready_count) return self.ready_count;

  var user = self.users[user_id];
  if(!user) throw new Error('用户不存在，不能举手');

  if(0 === user.seat) return self.ready_count;
  if(1 === user.ready_status) return self.ready_count;

  user.ready_status = 1;

  if(3 < (++self.ready_count)){
    self.act_status = 1;
  }

  return self.ready_count;
};

/**
 *
 * @return
 */
function getSeatNum(){
  switch(seatCount.call(this)){
    case 0:  return 1;
    case 1:  return 2;  // base
    case 2:  return 1;  // base
    case 3:  return 4;
    case 4:  return 1;  // base
    case 5:  return 2;
    case 6:  return 1;
    case 7:  return 8;
    case 8:  return 1;  // base
    case 9:  return 2;
    case 10: return 1;
    case 11: return 4;
    case 12: return 1;
    case 13: return 2;
    case 14: return 1;
    default: return 0;
  }
}

/**
 *
 * @return
 */
function seatCount(){
  var arr = _.keys(this.players);

  var count = 0;

  for(let i of arr){
    count += (i - 0);
  }

  return count;
}