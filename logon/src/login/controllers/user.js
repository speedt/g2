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

  biz.user.register(query)
  .then(() => {
    res.send({});
  })
  .catch(err => {
    if('string' === typeof err)
      return res.send({ error: { msg: err } });
    next(err);
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

  biz.user.login(query)
  .then(token => {
    res.send({ data: token })
  })
  .catch(err => {
    if('string' === typeof err)
      return res.send({ error: { msg: err } });
    next(err);
  });
};
