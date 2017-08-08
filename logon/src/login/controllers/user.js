/*!
 * emag.login
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const biz = require('emag.biz');

const conf  = require('../settings');
const utils = require('speedt-utils').utils;

exports.register = function(req, res, next){
  var query  = req.body;

  biz.user.register(query, function (err, code, doc){
    if(err)  return next(err);
    if(code) return res.send({ error: { msg: code } });
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
