/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd  = process.cwd();
const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');

const utils = require('speedt-utils').utils;
const _     = require('underscore');
const uuid  = require('node-uuid');

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

/**
 *
 */
exports.ready = function(user){
  return new Promise((resolve, reject) => {
    if(!user.group_id) return reject('invalid_group_id');
    if(0 < user.group_status) return reject('game_already_begun');  // 游戏已经开始
    if(0 === user.seat) return reject('no_need_ready');             // 你是游客
    if(0 < user.group_user_status) return reject('already_begun');  // 你已经举手
    console.log(user);
  });
};
