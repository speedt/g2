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

const md5   = require('speedt-utils').md5;
const utils = require('speedt-utils').utils;

const cfg = require('emag.cfg');
const biz = require('emag.biz');

const _  = require('underscore');
_.str    = require('underscore.string');
_.mixin(_.str.exports());

const logger = require('log4js').getLogger('model.roomPool');

var res = module.exports = {};

var rooms = {};

var free = [];

res.create = function(){
  logger.debug('%s::%s', free.length, _.size(rooms));

  var newRoom = free.shift();

  if(newRoom){
    newRoom.id = utils.replaceAll(uuid.v1(), '-', '');
    rooms[newRoom.id] = newRoom;
    return newRoom;
  }

  newRoom = { id: utils.replaceAll(uuid.v1(), '-', '') };
  rooms[newRoom.id] = newRoom;
  return newRoom;
};

res.get = function(id){
  return rooms[id];
};

res.release = function(id){
  var room = this.get(id);
  if(!room) return;
  free.push(room);
  delete rooms[id];
};
