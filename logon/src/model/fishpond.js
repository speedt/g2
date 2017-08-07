/*!
 * emag.model
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const cfg = require('emag.cfg');

const _ = require('underscore');

const log4js = require('log4js');
const logger = log4js.getLogger('fishpond');

const fishPool = require('./fishPool');

module.exports = function(opts){
  return new Method(opts);
}

var Method = function(opts){
  var self           = this;
  self._fishes       = {};
  self._fishesWeight = 0;
  self.init(opts);
};

var pro = Method.prototype;

pro.init = function(opts){
  var self      = this;
  self.id       = opts.id;
  self.capacity = cfg.sys['group_type_'+ opts.type +'_capacity'] - 0;
  self.type     = opts.type;
  self._pause   = 0;
  return self;
};

pro.clearAll = function(){
  var self = this;
  // self._fishes.splice(0, self._fishes.length);

  for(let fish of _.values(self._fishes)){
    self.clearFish(fish);
  }

  if(0 !== self._fishesWeight){
    logger.error('clearAll: %s::%s', self.id, self._fishesWeight);
  }
};

pro.clearFish = function(fish){
  var self = this;
  if(!fish) return;
  self._fishesWeight -= fish.weight;
  fishPool.release(fish.id);
  delete self._fishes[fish.id];
};

pro.getFishesWeight = function(){
  return this._fishesWeight;
};

pro.getFishes = function(){
  return this._fishes;
};

pro.pause = function(time){
  if(time) return (this._pause += time);
  if(0 >= this._pause) return false;
  if(0 === (--this._pause)) return 'unfreeze';
  return true;
};

/**
 * 放入一条鱼
 *
 * @params
 * @return
 */
pro.put = function(fish, force){
  var self = this;

  if(!fish) return;

  if(!force){
    if(self._fishesWeight >= self.capacity) return fishPool.release(fish.id);
  }

  if(self._fishes[fish.id]) return fishPool.release(fish.id);
  self._fishes[fish.id] = fish;
  self._fishesWeight += fish.weight;

  logger.debug('%s::%s', _.size(self._fishes), self._fishesWeight);
  return fish;
};

/**
 * 让所有鱼游动
 *
 * @params
 * @return
 */
pro.refresh = function(){
  var self = this;

  for(let fish of _.values(self._fishes)){

    if((fish.trailLen - 1) === fish.step){
      if(fish.loop){
        fish.step = 0;
      }else{
        self.clearFish(fish);
      }
    }else{
      fish.step++;
    }
  }

  return self._fishes;
}

pro.blast = function(bullet, fishes, user_info){

  var self = this;

  var result = [];

  for(let f of fishes){

    var fish = self._fishes[f];

    if(!fish) continue;

    logger.debug('blast 1: %j', fish);

    var bullet_range = cfg.sys['bullet_range_lv_'+ bullet.level];

    if(!bullet_range) continue;

    logger.debug('blast 2: %j', bullet_range);

    var trail_info = cfg.fishTrail[fish.path];

    if(!trail_info) continue;

    logger.debug('blast 3: %s', trail_info.length);

    var s = trail_info[fish.step];

    if(!s) continue;

    // 取上一步的位置
    var s1 = trail_info[fish.step - 1];

    if(!s1) continue;

    var d = distance(s1[0], s1[1], s[0], s[1], bullet.x2, bullet.y2, this.timestamp);   

    if(d > bullet_range) continue;

    logger.debug('blast 4: %s', d);

    if(!(--fish.hp < 1)){
      logger.debug('blast 5: %j', fish);
      continue;
    }

    logger.debug('user info: %j', user_info);

    var arithmetic  = user_info.score / (user_info.score + user_info.group_consume_score - user_info.group_gain_score);

    logger.debug('arithmetic: %j', arithmetic);

    var lucky       = cfg.sys['group_type_'+ this.type +'_profit_loss_rate'] - arithmetic;

    logger.debug('lucky: %j', lucky);

    var probability = (cfg.fishType[fish.type].dead_probability - 0) + (user_info.success_rate_capture - 0);

    logger.debug('probability: %j', probability);

    probability     = probability + (1 - probability) * lucky;

    logger.debug('probability: %j', probability);

    var r = Math.random();

    logger.debug('r: %j', r);

    if(!(r < probability)) continue;

    logger.debug('blast 6: %s', r);

    // 根据玩家的幸运值与盈亏比率在进行判断
    // 根据配置表生成特殊物品掉落率

    var gift_count = (Math.random() < cfg.fishType[fish.type].tool_probability) ?
                      Math.random() * cfg.fishType[fish.type].tool_max : 0;

    gift_count *= user_info.success_rate_gift;

    result.push({
      id:     fish.id,
      type:   fish.type,
      money:  parseInt(_.random((cfg.fishType[fish.type].money_min - 0), (cfg.fishType[fish.type].money_max - 0)) * (bullet.consume - 0)),
      gift:   parseInt(gift_count),
      tool_1: 0,
      tool_2: 0
    });

    self.clearFish(fish);
  }

  logger.debug('dead fishes: %j', result);

  return result;
};

// /**
//  * 计算两点间距离
//  */
// function distance(x1, y1, x2, y2){
//   var xdiff = x2 - x1;
//   var ydiff = y2 - y1;
//   return Math.abs(Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5));
// }

/**
 * 计算两点间距离
 *
 * @param x1 y1     上一次结点位置(step-1)
 * @param x2 y2     下一次结点位置(step)
 * @param bx by     爆炸点位置(客户端传来)
 * @param last_time 上一次结点位置改变时的时间
 * @return
 */
function distance(x1, y1, x2, y2, bx, by, last_time){
  var ler = _.now() - last_time;
  ler = (ler > 0) ? (ler / (cfg.sys['fishjoy_fish_tide_interval_time'] - 0)) : 0;

  var fx = x1 + (x2 - x1) * ler;
  var fy = y1 + (y2 - y1) * ler;

  return Math.sqrt(Math.pow(bx - fx, 2) + Math.pow(by - fy, 2));
}
