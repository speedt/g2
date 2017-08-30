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
  self.fund          = opts.fund;
  self.round_count   = opts.round_count;
  self.visitor_count = opts.visitor_count;
  self._round_id     = utils.replaceAll(uuid.v4(), '-', '');
  self._players      = {};
  self._visitors     = {};
  self._users        = {};
};

var pro = Method.prototype;

pro.release = function(){
  return true;
};

pro.entry = function(user){
  this._users[user.id] = user;

  if(0 < user.seat){
    this._players[user.seat] = user.id;
  }else{
    this._visitors[user.id] = user;
  }
};

pro.quit = function(user_id){
  var self = this;

  var user = self.getUser(user_id);
  if(!user) return;

  delete self._users[user.id];

  if(0 < user.seat){
    delete self._players[user.seat];
  }else{
    delete self._visitors[user.id];
  }

  return self;
};

pro.getUsers = function(){
  return this._users;
};

pro.getUser = function(user_id){
  return this._users[user_id];
}
