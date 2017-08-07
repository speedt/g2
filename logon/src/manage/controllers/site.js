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

/**
 *
 * @params
 * @return
 */
exports.indexUI = function(req, res, next){
  res.render('back/index', {
    conf: conf,
    description: '',
    keywords: ',html5',
    data: {
      session_user: req.session.user,
      nav_choose:   ',01,'
    }
  });
};

/**
 *
 * @params
 * @return
 */
exports.welcomeUI = function(req, res, next){
  res.render('back/welcome', {
    conf: conf,
    description: '',
    keywords: ',html5'
  });
};
