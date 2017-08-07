/*!
 * emag.biz
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const path = require('path');
const cwd = process.cwd();

const conf = require(path.join(cwd, 'settings'));

const EventProxy = require('eventproxy');
const uuid = require('node-uuid');

const utils = require('speedt-utils').utils;

const mysql = require('emag.db').mysql;
const redis = require('emag.db').redis;

const _ = require('underscore');

const user = require('./user');
const user_purchase = require('./user_purchase');
const goods = require('./goods');

const logger = require('log4js').getLogger('payment');

(() => {

  function step1(payInfo, conn, resolve, reject){
    user.updatePurchase(payInfo.user_id, payInfo.amount, function (err, status){
      if(err) return reject(err);
      if(0 === status.changedRows) return reject('10');
      resolve();
    }, conn);
  }

  function step2(payInfo, conn, resolve, reject){
    payInfo.goods_id = payInfo.product_id;

    user_purchase.saveNew(payInfo, function (err, doc){
      if(err) return reject(err);
      resolve(doc);
    }, conn);
  }

  function step3(payInfo, conn, resolve, reject){

    user.updateVip(payInfo.user_id, function (err, status){
      if(err) return reject(err);
      resolve();
    }, conn);
  }

  function step4(payInfo, resolve, reject){

    user.getById(payInfo.user_id, function (err, doc){
      if(err) return reject(err);
      if(!doc) return reject('11');
      resolve(doc);
    });
  }

  function step5(conn, resolve, reject){
    conn.commit(function (err){
      if(err) return reject(err);
      resolve();
    });
  }

  function step6(payInfo, resolve, reject){

    user.updateUserVip(payInfo.user_id, function (err, status){
      if(err) return reject(err);
      resolve(status);
    });
  }

  var private_key  = 'E2D5511AFC845DDF8CE220ACE2A0A1C9';
  var enhanced_key = 'OWE2ZmMyOGVmMWNhYzc0MmYyOWU';

  function validate(payInfo){
    return true;
  }

  exports.notice = function(payInfo, cb){
    if(!validate(payInfo)) return cb(null, '01');

    // ------------------------------------------------------

    payInfo.user_id = payInfo.user_id || '';

    if(!_.isString(payInfo.user_id)) return cb(null, '02');

    payInfo.user_id = payInfo.user_id.trim();

    if(_.isEmpty(payInfo.user_id)) return cb(null, '03');

    logger.debug('notice param user_id: %s', payInfo.user_id);

    // ------------------------------------------------------

    payInfo.amount = payInfo.amount || 0;

    payInfo.amount -= 0;

    if(!_.isNumber(payInfo.amount)) return cb(null, '04');

    logger.debug('notice param amount: %s', payInfo.amount);

    if(!(0 < payInfo.amount)) return cb(null, '05');

    // ------------------------------------------------------

    payInfo.product_id = payInfo.product_id || '';

    if(!_.isString(payInfo.product_id)) return cb(null, '06');

    payInfo.product_id = payInfo.product_id.trim();

    if(_.isEmpty(payInfo.product_id)) return cb(null, '07');

    logger.debug('notice param product_id: %s', payInfo.product_id);

    // ------------------------------------------------------

    payInfo.order_id = payInfo.order_id || '';

    if(!_.isString(payInfo.order_id)) return cb(null, '08');

    payInfo.order_id = payInfo.order_id.trim();

    if(_.isEmpty(payInfo.order_id)) return cb(null, '09');

    logger.debug('notice param order_id: %s', payInfo.order_id);

    // ------------------------------------------------------

    mysql.getPool().getConnection((err, conn) => {
      if(err) return cb(err);

      conn.beginTransaction(function (err){
        if(err) return cb(err);

        new Promise(step1.bind(null, payInfo, conn)).then(function(){
          return new Promise(step2.bind(null, payInfo, conn));
        }).then(function(){
          return new Promise(step3.bind(null, payInfo, conn));
        }).then(function(){
          return new Promise(step5.bind(null, conn));
        }).then(function(){
          return new Promise(step6.bind(null, payInfo));
        }).then(function(){
          return new Promise(step4.bind(null, payInfo));
        }).then(function (user_info){
          cb(null, null, user_info);
        }).catch(err => {
          conn.rollback(function(){
            if('object' === typeof err) return cb(err);
            cb(null, err);
          });
        });

      });
    });

  };
})();
