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

const log4js = require('log4js');

const logger = log4js.getLogger('notice');

const _ = require('underscore');

exports.indexUI = function(req, res, next){

  biz.notice.findAll(function (err, docs){

    res.render('notice/index', {
      conf: conf,
      data: {
        list_notice:     docs,
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

(function(){
  var activemq = conf.activemq;

  var Stomp = require('stompjs');
  var client = Stomp.overTCP(activemq.host, activemq.port);

  client.heartbeat.outgoing = 20000;
  // client will send heartbeats every 20000ms
  client.heartbeat.incoming = 10000;

  var onCb = function(frame){
    logger.debug('notice send ready: OK');
  };

  exports.payment = function(req, res, next){
    var query = req.body;

    res.send('OK');

    biz.payment.notice(query, function (err, code, doc){
      if(err) return next(err);
      if(code) return;

      if(!client) return;

      var user_info = doc;

      biz.frontend.findAll(function (err, docs){
        if(err) return next(err);
        if(!docs) return;
        if(0 === docs.length) return;

        var data = JSON.stringify({
          method:   1012,
          receiver: 'ALL',
          data:     user_info
        });

        for(let i of docs){
          client.send('/queue/back.send.v2.'+ i, { priority: 8 }, data);
        }

      });
    });
  };

  exports.send = function(req, res, next){
    var query = req.body;

    if(!client) return res.send({ error: { msg: '消息服务异常' } });

    biz.notice.getById(query.id, function (err, doc){
      if(err) return next(err);
      if(!doc) return res.send({ error: { msg: 'Not Found' } });

      biz.frontend.findAll(function (err, docs){
        if(err) return next(err);
        if(!docs) return res.send({ error: { msg: 'Not Found' } });
        if(0 === docs.length) return res.send({ error: { msg: 'Not Found' } });

        var data = JSON.stringify({
          method:   1008,
          receiver: 'ALL',
          data:     doc.content
        });

        for(let i of docs){
          client.send('/queue/back.send.v2.'+ i, { priority: 8 }, data);
        }

        res.send({});

      });
    });
  };

  function _unsubscribe(){
    if(!client) return;

    client.disconnect(() => {
      logger.info('stompjs client disconnect: %s', _.now());
    });
  }

  var onErr = function(err){
    _unsubscribe();
    logger.error('stompjs client:', err);
  };

  process.on('uncaughtException', err => {
    _unsubscribe();
  });

  process.on('exit', () => {
    _unsubscribe();
  });

  const headers = {
    login: activemq.user,
    passcode: activemq.password,
  };

  client.connect(headers, onCb, onErr);
})();
