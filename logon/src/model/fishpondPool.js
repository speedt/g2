/*!
 * emag.model
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const utils = require('speedt-utils').utils;
const uuid = require('node-uuid');

const _      = require('underscore');

const log4js = require('log4js');
const logger = log4js.getLogger('fishpondPool');

var Fishpond = require('./fishpond');

var res = module.exports = {};

var fishponds = {};

var free = {};

res.create = function(opts){

  logger.debug('%s', _.size(fishponds));

  var type       = free[opts.type];

  if(!type) type = free[opts.type] = [];

  var newFishpond = type.shift();

  if(newFishpond){
    newFishpond.init(opts);
    fishponds[newFishpond.id] = newFishpond;
    return newFishpond;
  }

  newFishpond = new Fishpond(opts);
  fishponds[newFishpond.id] = newFishpond;
  return newFishpond;
};

res.get = function(id){
  return fishponds[id];
};

res.release = function(id){
  var fishpond = this.get(id);
  if(!fishpond) return;
  fishpond.clearAll();
  free[fishpond.type].push(fishpond);
  delete fishponds[id];
};
