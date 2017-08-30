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
  var self           = this;
  self.id            = opts.id;
  self.name          = opts.name || ('Room '+ opts.id);
  self.fund          = opts.fund;  // 组局基金
  self.round_count   = opts.round_count;  // 圈数
  self.visitor_count = opts.visitor_count;  // 游客人数
  self.round_id      = utils.replaceAll(uuid.v4(), '-', '');
  self.players       = {};
  self.users         = {};
  self.ready_count   = 0;  // 举手人数
};

var pro = Method.prototype;

pro.release = function(){
  return true;
};

pro.entry = function(user){
  var self = this;
  if(self.users[user.id]) throw new Error('已经进入该房间');

  self.users[user.id] = user;

  if(0 === user.seat) return;

  self.players[user.seat] = user.id;
};

pro.quit = function(user_id){
  var self = this;

  var user = self.users[user_id];
  if(!user) return;

  if(0 < user.seat){
    delete self.players[user.seat];
  }

  delete self.users[user_id];
};
