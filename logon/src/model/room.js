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

const logger = require('log4js').getLogger('model.room');

module.exports = function(opts){
  return new Method(opts);
}

var Method = function(opts){
  var self      = this;
  self.players  = {};
  self.visitors = {};
  self.init(opts);
};

var pro = Method.prototype;

pro.init = function(opts){
  var self = this;
  self.id  = opts.id;
  return self;
};

pro.release = function(){
};
