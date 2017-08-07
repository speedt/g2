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
        list_goods:   docs,
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

  var p1 = new Promise((resolve, reject) => {

    biz.goods.getById(id, function (err, doc){
      if(err)  return reject(err);
      if(!doc) return reject(new Error('Not Found'));
      resolve(doc);
    });
  });

  var p2 = new Promise((resolve, reject) => {

    biz.goods.findDetailById(id, function (err, docs){
      if(err) return reject(err);
      resolve(docs);
    });
  });

  Promise.all([p1, p2]).then(values => {

    res.render('goods/edit', {
      conf: conf,
      data: {
        goods:             values[0],
        list_goods_detail: values[1],
        session_user:      req.session.user,
        nav_choose:        ',04,0402,'
      }
    });
  }).catch(next);
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
