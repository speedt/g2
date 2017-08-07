/*!
 * emag.manage
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const biz = require('emag.biz');
const _   = require('underscore');

const conf  = require('../settings');
const utils = require('speedt-utils').utils;

exports.indexUI = function(req, res, next){

  biz.goods.findAll(function (err, docs){
    if(err) return next(err);

    res.render('goods/index', {
      conf: conf,
      data: {
        list_goods:  docs,
        session_user: req.session.user,
        nav_choose:   ',04,0402,'
      }
    });
  });
};

exports.addUI = function(req, res, next){
  res.render('goods/add', {
    conf: conf,
    data: {
      session_user: req.session.user,
      nav_choose:   ',04,0402,'
    }
  });
};

exports.add = function(req, res, next){
  var query = req.body;

  query.user_id = req.session.userId;

  biz.goods.saveNew(query, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};

exports.editUI = function(req, res, next){
  var id = req.query.id;

  biz.goods.getById(id, function (err, doc){
    if(err)  return next(err);
    if(!doc) return next(new Error('Not Found'));

    res.render('goods/edit', {
      conf: conf,
      data: {
        goods:       doc,
        session_user: req.session.user,
        nav_choose:   ',04,0402,'
      }
    });
  });
};

exports.edit = function(req, res, next){
  var query = req.body;

  biz.goods.editInfo(query, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};

exports.del = function(req, res, next){
  var query = req.body;

  biz.goods.del(query.id, function (err, status){
    if(err) return next(err);
    res.send({});
  });
};
