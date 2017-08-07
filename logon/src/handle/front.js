/*!
 * emag.handle
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('handle');

const biz    = require('emag.biz');

exports.start = function(msg){
  if(!msg.body) return logger.error('front start empty');

  var front_id = msg.body;

  biz.frontend.open(front_id, (err, code) => {
    if(err) return logger.error('front %j start:', front_id, err);
    logger.info('front %j start: %j', front_id, code);
  });
};

exports.stop = function(msg){
  if(!msg.body) return logger.error('front stop empty');

  var front_id = msg.body;

  biz.frontend.close(front_id, (err, code) => {
    if(err) return logger.error('front %j stop:', front_id, err);
    logger.info('front %j stop: %j', front_id, code);
  });
};
