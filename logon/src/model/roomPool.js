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

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const _  = require('underscore');
_.str    = require('underscore.string');
_.mixin(_.str.exports());

var Room = require('./room');

const logger = require('log4js').getLogger('model.roomPool');

var res = module.exports = {};

var rooms = {};

res.create = function(group_info){
  if(!group_info) return;
  if(this.get(group_info.id)) return;

  var room = new Room(group_info);
  rooms[room.id] = room;
  return room;
};

res.get = function(id){
  return rooms[id];
};

res.release = function(id){
  var room = this.get(id);
  if(!room) return;
  if(!room.release()) return;
  delete rooms[id];
};
