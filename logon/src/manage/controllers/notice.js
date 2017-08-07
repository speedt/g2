/*!
 * emag.manage
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const URL = require('url');

const conf = require('../settings');
const utils = require('speedt-utils').utils;

const biz = require('emag.biz');

const _ = require('underscore');

const logger = require('log4js').getLogger('notice');

exports.indexUI = function(req, res, next){

  biz.notice.findAll(function (err, docs){

    res.render('notice/index', {
      conf: conf,
      data: {
        list_notice:  docs,
        session_user: req.session.user,
        nav_choose:   ',04,0401,'
      }
    });
  });
};

exports.addUI = function(req, res, next){
  res.render('notice/add', {
    conf: conf,
    data: {
      session_user: req.session.user,
      nav_choose:   ',04,0401,'
    }
  });
};

exports.add = function(req, res, next){
  var query = req.body;

  query.user_id = req.session.userId;

  biz.notice.saveNew(query, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};

exports.editUI = function(req, res, next){

  var id = req.query.id;

  biz.notice.getById(id, function (err, doc){
    if(err) return next(err);

    res.render('notice/edit', {
      conf: conf,
      data: {
        notice:       doc,
        session_user: req.session.user,
        nav_choose:   ',04,0401,'
      }
    });
  });
};

exports.edit = function(req, res, next){
  var query = req.body;

  biz.notice.saveInfo(query, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};

exports.del = function(req, res, next){
  var query = req.body;

  biz.notice.del(query.id, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};
