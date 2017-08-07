/*!
 * emag.manage
 * Copyright(c) 2016 huangxin <3203317@qq.com>
 * MIT Licensed
 */
'use strict';

const cfg     = require('../controllers/cfg');
const manager = require('../controllers/manager');
const site    = require('../controllers/site');

module.exports = function(app){

  app.get ('/settings/',     manager.login_validate, cfg.indexUI);
  app.post('/settings/edit', manager.login_validate, cfg.edit);

  app.get ('/manager/profile$',   manager.login_validate, manager.profileUI);
  app.post('/manager/changePwd',  manager.login_validate, manager.changePwd);
  app.get ('/manager/changePwd$', manager.login_validate, manager.changePwdUI);

  app.get ('/manager/login$',  manager.loginUI);
  app.post('/manager/login$',  manager.login);
  app.get ('/manager/logout$', manager.logoutUI);

  app.get('/welcome$', manager.login_validate, site.welcomeUI);
  app.get ('/',        manager.login_validate, site.indexUI);
};
