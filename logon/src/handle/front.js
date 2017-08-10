/*!
 * emag.handle
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const _      = require('underscore');
const logger = require('log4js').getLogger('handle');

exports.start = function(msg){
  if(!msg.body) return logger.error('front start empty');
  var front_id = msg.body;
  logger.info('front %j start: %j', front_id, _.now());
};

exports.stop = function(msg){
  if(!msg.body) return logger.error('front stop empty');
  var front_id = msg.body;
  logger.info('front %j stop: %j', front_id, _.now());
};
