/*!
 * emag.login
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const URL = require('url');

const conf = require('../settings');
const utils = require('speedt-utils').utils;

const biz = require('emag.biz');

exports.resetPwd = function(req, res, next){
  var query = req.body;

  biz.user.resetPwd(query.id, '123456', function (err, status){
    if(err) return next(err);
    res.send({});
  });
};

exports.del = function(req, res, next){
  var query = req.body;

  biz.user.del(query.id, 0, function (err, status){
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
  res.render('front/login', {
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

exports.giftLoginUI = function(req, res, next){

  var id = req.query.id;

  biz.userGift.findLoginByUserId(id, function (err, docs){

    res.render('user/gift_login', {
      conf: conf,
      data: {
        list_gift_login: docs,
        session_user:    req.session.user,
        nav_choose:      ',03,0301,'
      }
    });
  });
};

exports.purchaseUI = function(req, res, next){

  var id = req.query.id;

  biz.userPurchase.findAllByUserId(id, function (err, docs){

    res.render('user/purchase', {
      conf: conf,
      data: {
        list_purchase: docs,
        session_user:  req.session.user,
        nav_choose:    ',03,0301,'
      }
    });
  });
};

exports.indexUI = function(req, res, next){

  biz.user.findAll(1, function (err, docs){

    res.render('user/index', {
      conf: conf,
      data: {
        list_user:    docs,
        session_user: req.session.user,
        nav_choose:   ',03,0301,'
      }
    });
  });
};

exports.editUI = function(req, res, next){

  var id = req.query.id;

  biz.user.getById(id, function (err, doc){
    if(err) return next(err);

    res.render('user/edit', {
      conf: conf,
      data: {
        user:         doc,
        session_user: req.session.user,
        nav_choose:   ',03,0301,'
      }
    });
  });
};

exports.edit = function(req, res, next){
  var query = req.body;

  biz.user.saveBaseInfo(query, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};
