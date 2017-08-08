/*!
 * emag.login
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const biz = require('emag.biz');
const cfg = require('emag.cfg');

const conf  = require('../settings');
const utils = require('speedt-utils').utils;

exports.resetPwd = function(req, res, next){
  var query = req.body;

  biz.user.resetPwd(query.id, '123456', function (err, status){
    if(err) return next(err);
    res.send({});
  });
};

exports.register = function(req, res, next){
  var query  = req.body;

  query.score = 1000;

  biz.user.register(query, function (err, warn, doc){
    if(err) return next(err);
    if(warn) return res.send({ error: { msg: warn } });
    res.send({});
  });
};

exports.loginUI = function(req, res, next){
  res.render('user/login', {
    conf: conf,
    data: {}
  });
};

exports.login = function(req, res, next){
  var query = req.body;

  biz.user.login(query, (err, code, token /* 授权码及服务器信息 */) => {
    if(err) return next(err);
    if(code) return res.send({ error: { code: code } });
    res.send({ data: token });
  });
};
