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

exports.changePwd = function(req, res, next){
  var query = req.body;

  query.id = req.session.userId;

  biz.manager.changePwd(query, function (err, warn, status){
    if(err) return next(err);
    if(warn) return res.send({ error: { msg: warn } });
    res.send({});
  });
};

exports.changePwdUI = function(req, res, next){
  res.render('manager/changePwd', {
    conf: conf,
    data: {
      session_user: req.session.user,
    }
  });
};

exports.profileUI = function(req, res, next){
  res.render('manager/profile', {
    conf: conf,
    data: {
      session_user: req.session.user,
    }
  });
};

exports.loginUI = function(req, res, next){

  res.render('manager/login', {
    conf: conf,
    data: {
      refererUrl: req.query.refererUrl || ''
    }
  });
};

exports.login = function(req, res, next){
  var query = req.body;

  biz.manager.login(query, (err, code, doc) => {
    if(err)  return next(err);
    if(code) return res.send({ error: { msg: code } });

    // session
    req.session.userId = doc.id;
    req.session.user = doc;

    res.send({});
  });
};

exports.login_validate = function(req, res, next){
  if(req.session.userId) return next();
  if(req.xhr) return res.send({ error: { msg: '无权访问' } });
  res.redirect('/manage/manager/login?refererUrl='+ escape(req.url));
};

exports.logoutUI = function(req, res, next){
  req.session.destroy();
  res.redirect('/manage/manager/login');
};
