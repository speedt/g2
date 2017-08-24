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

const amq = require('emag.lib').amq;

exports.indexUI = function(req, res, next){

  biz.notice.findAll(function (err, docs){
    if(err) return next(err);

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
    if(err)  return next(err);
    if(!doc) return next(new Error('Not Found'));

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

  biz.notice.editInfo(query, function (err, status){
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

exports.send = function(req, res, next){
  var query = req.body;

  biz.frontend.findAll()
  .then(docs => {
    if(0 === docs.length) return next(new Error('前置机未启动'));

    biz.notice.getById(query.id, function (err, doc){
      if(err)  return next(err);
      if(!doc) return next(new Error('Not Found'));

      delete doc.user_id;
      delete doc.last_time;

      var data = ['ALL', JSON.stringify([conf.app.ver, 1008, , _.now(), doc])];

      for(let i of docs){
        amq.send('/queue/back.send.v3.'+ i, { priority: 8 }, data, (err, code) => { /*  */ });
      }

      res.send({});
    });
  })
  .catch(next);
};
