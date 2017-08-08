/*
Navicat MySQL Data Transfer

Source Server         : 127.0.0.1
Source Server Version : 50623
Source Host           : 127.0.0.1:12306
Source Database       : emag2

Target Server Type    : MYSQL
Target Server Version : 50623
File Encoding         : 65001

Date: 2017-08-08 10:39:48
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `s_cfg`
-- ----------------------------
DROP TABLE IF EXISTS `s_cfg`;
CREATE TABLE `s_cfg` (
  `type_` varchar(32) NOT NULL DEFAULT '',
  `key_` varchar(64) NOT NULL DEFAULT '',
  `value_` varchar(32) DEFAULT NULL,
  `title` varchar(64) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `status` int(2) DEFAULT NULL,
  PRIMARY KEY (`key_`,`type_`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of s_cfg
-- ----------------------------
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '1', '2', '转盘：格子：1', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '2', '3', '转盘：格子：2', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '3', '1', '转盘：格子：3', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '4', '4', '转盘：格子：4', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '5', '5020b6507bce11e784627dd159406629', '转盘：格子：5', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '6', '587a29d07bce11e784627dd159406629', '转盘：格子：6', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '7', '0618ba207bcf11e784627dd159406629', '转盘：格子：7', null, null, '1');
INSERT INTO `s_cfg` VALUES ('wheel_of_fortune', '8', '170f87f07bcf11e784627dd159406629', '转盘：格子：8', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'bullet_lv_max', '20', '组类型：白银：炮最大等级', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'bullet_lv_max', '29', '组类型：黄金：炮最大等级', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'bullet_lv_max', '11', '组类型：青铜：炮最大等级', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'bullet_lv_min', '11', '组类型：白银：炮最小等级', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'bullet_lv_min', '20', '组类型：黄金：炮最小等级', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'bullet_lv_min', '1', '组类型：青铜：炮最小等级', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'capacity', '130', '组类型：白银：容量', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'capacity', '130', '组类型：黄金：容量', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'capacity', '130', '组类型：青铜：容量', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'consume_freeze', '1000', '组类型：白银：冰冻消耗', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'consume_freeze', '10000', '组类型：黄金：冰冻消耗', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'consume_freeze', '100', '组类型：青铜：冰冻消耗', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'consume_lock', '1000', '组类型：白银：锁定消耗', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'consume_lock', '10000', '组类型：黄金：锁定消耗', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'consume_lock', '100', '组类型：青铜：锁定消耗', null, null, '1');
INSERT INTO `s_cfg` VALUES ('fishjoy', 'fish_tide_interval_time', '300', '常规：鱼潮间隔（毫秒）', null, null, '0');
INSERT INTO `s_cfg` VALUES ('fishjoy', 'fish_tide_trail_count', '9', '常规：鱼潮轨迹（个）', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'free_swim_time', '180', '组类型：白银：自由游动时间', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'free_swim_time', '180', '组类型：黄金：自由游动时间', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'free_swim_time', '180', '组类型：青铜：自由游动时间', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_1', '1', '炮弹：消耗：等级01', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_1', '0.3', '炮弹：范围：等级01', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_1', '1', '炮弹：样式：等级01', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_10', '90', '炮弹：消耗：等级10', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_10', '0.3', '炮弹：范围：等级10', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_10', '10', '炮弹：样式：等级10', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_11', '100', '炮弹：消耗：等级11', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_11', '0.3', '炮弹：范围：等级11', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_11', '11', '炮弹：样式：等级11', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_12', '200', '炮弹：消耗：等级12', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_12', '0.3', '炮弹：范围：等级12', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_12', '12', '炮弹：样式：等级12', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_13', '300', '炮弹：消耗：等级13', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_13', '0.3', '炮弹：范围：等级13', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_13', '13', '炮弹：样式：等级13', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_14', '400', '炮弹：消耗：等级14', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_14', '0.3', '炮弹：范围：等级14', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_14', '14', '炮弹：样式：等级14', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_15', '500', '炮弹：消耗：等级15', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_15', '0.3', '炮弹：范围：等级15', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_15', '15', '炮弹：样式：等级15', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_16', '600', '炮弹：消耗：等级16', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_16', '0.3', '炮弹：范围：等级16', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_16', '16', '炮弹：样式：等级16', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_17', '700', '炮弹：消耗：等级17', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_17', '0.3', '炮弹：范围：等级17', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_17', '17', '炮弹：样式：等级17', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_18', '800', '炮弹：消耗：等级18', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_18', '0.3', '炮弹：范围：等级18', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_18', '18', '炮弹：样式：等级18', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_19', '900', '炮弹：消耗：等级19', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_19', '0.3', '炮弹：范围：等级19', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_19', '19', '炮弹：样式：等级19', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_2', '10', '炮弹：消耗：等级02', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_2', '0.3', '炮弹：范围：等级02', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_2', '2', '炮弹：样式：等级02', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_20', '1000', '炮弹：消耗：等级20', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_20', '0.3', '炮弹：范围：等级20', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_20', '20', '炮弹：样式：等级20', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_21', '2000', '炮弹：消耗：等级21', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_21', '0.3', '炮弹：范围：等级21', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_21', '21', '炮弹：样式：等级21', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_22', '3000', '炮弹：消耗：等级22', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_22', '0.3', '炮弹：范围：等级22', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_22', '22', '炮弹：样式：等级22', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_23', '4000', '炮弹：消耗：等级23', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_23', '0.3', '炮弹：范围：等级23', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_23', '23', '炮弹：样式：等级23', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_24', '5000', '炮弹：消耗：等级24', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_24', '0.3', '炮弹：范围：等级24', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_24', '24', '炮弹：样式：等级24', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_25', '6000', '炮弹：消耗：等级25', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_25', '0.3', '炮弹：范围：等级25', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_25', '25', '炮弹：样式：等级25', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_26', '7000', '炮弹：消耗：等级26', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_26', '0.3', '炮弹：范围：等级26', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_26', '26', '炮弹：样式：等级26', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_27', '8000', '炮弹：消耗：等级27', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_27', '0.3', '炮弹：范围：等级27', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_27', '27', '炮弹：样式：等级27', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_28', '9000', '炮弹：消耗：等级28', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_28', '0.3', '炮弹：范围：等级28', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_28', '28', '炮弹：样式：等级28', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_29', '10000', '炮弹：消耗：等级29', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_29', '0.3', '炮弹：范围：等级29', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_29', '29', '炮弹：样式：等级29', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_3', '20', '炮弹：消耗：等级03', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_3', '0.3', '炮弹：范围：等级03', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_3', '3', '炮弹：样式：等级03', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_4', '30', '炮弹：消耗：等级04', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_4', '0.3', '炮弹：范围：等级04', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_4', '4', '炮弹：样式：等级04', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_5', '40', '炮弹：消耗：等级05', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_5', '0.3', '炮弹：范围：等级05', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_5', '5', '炮弹：样式：等级05', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_6', '50', '炮弹：消耗：等级06', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_6', '0.3', '炮弹：范围：等级06', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_6', '6', '炮弹：样式：等级06', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_7', '60', '炮弹：消耗：等级07', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_7', '0.3', '炮弹：范围：等级07', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_7', '7', '炮弹：样式：等级07', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_8', '70', '炮弹：消耗：等级08', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_8', '0.3', '炮弹：范围：等级08', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_8', '8', '炮弹：样式：等级08', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_consume', 'lv_9', '80', '炮弹：消耗：等级09', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_range', 'lv_9', '0.3', '炮弹：范围：等级09', null, null, '1');
INSERT INTO `s_cfg` VALUES ('bullet_style', 'lv_9', '9', '炮弹：样式：等级09', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'min_run', '1', '组类型：白银：最少N人开玩', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'min_run', '1', '组类型：黄金：最少N人开玩', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'min_run', '1', '组类型：青铜：最少N人开玩', null, null, '0');
INSERT INTO `s_cfg` VALUES ('vip_0', 'open_time', '8784', 'VIP0：开通：时间（小时）', null, null, '0');
INSERT INTO `s_cfg` VALUES ('vip_1', 'open_time', '24', 'VIP1：开通：时间（小时）', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_2', 'open_time', '48', 'VIP2：开通：时间（小时）', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_3', 'open_time', '72', 'VIP3：开通：时间（小时）', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_4', 'open_time', '96', 'VIP4：开通：时间（小时）', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_5', 'open_time', '120', 'VIP5：开通：时间（小时）', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'profit_loss_rate', '1', '组类型：白银：盈亏率', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'profit_loss_rate', '1', '组类型：黄金：盈亏率', null, null, '1');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'profit_loss_rate', '1', '组类型：青铜：盈亏率', null, null, '1');
INSERT INTO `s_cfg` VALUES ('tool_killNets', 'show_count', '8', '道具：一网打尽：出鱼数量', null, null, '0');
INSERT INTO `s_cfg` VALUES ('vip_0', 'success_rate_capture', '0', 'VIP0：成功率：捕鱼', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_1', 'success_rate_capture', '0.02', 'VIP1：成功率：捕鱼', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_2', 'success_rate_capture', '0.05', 'VIP2：成功率：捕鱼', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_3', 'success_rate_capture', '0.1', 'VIP3：成功率：捕鱼', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_4', 'success_rate_capture', '0.15', 'VIP4：成功率：捕鱼', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_5', 'success_rate_capture', '0.2', 'VIP5：成功率：捕鱼', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_0', 'success_rate_gift', '1', 'VIP0：成功率：礼券', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_1', 'success_rate_gift', '1.25', 'VIP1：成功率：礼券', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_2', 'success_rate_gift', '1.5', 'VIP2：成功率：礼券', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_3', 'success_rate_gift', '2', 'VIP3：成功率：礼券', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_4', 'success_rate_gift', '3', 'VIP4：成功率：礼券', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_5', 'success_rate_gift', '6', 'VIP5：成功率：礼券', null, null, '1');
INSERT INTO `s_cfg` VALUES ('tool_freeze', 'time', '30', '道具：冰冻：时间', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'total_players', '4', '组类型：白银：总玩家数', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'total_players', '4', '组类型：黄金：总玩家数', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'total_players', '4', '组类型：青铜：总玩家数', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_baiyin', 'total_visitors', '0', '组类型：白银：总观看数', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_huangjin', 'total_visitors', '0', '组类型：黄金：总观看数', null, null, '0');
INSERT INTO `s_cfg` VALUES ('group_type_qingtong', 'total_visitors', '0', '组类型：青铜：总观看数', null, null, '0');
INSERT INTO `s_cfg` VALUES ('vip_1', 'upgrade_purchase', '20', 'VIP1：升级：消费', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_2', 'upgrade_purchase', '40', 'VIP2：升级：消费', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_3', 'upgrade_purchase', '60', 'VIP3：升级：消费', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_4', 'upgrade_purchase', '80', 'VIP4：升级：消费', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_5', 'upgrade_purchase', '100', 'VIP5：升级：消费', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_0', 'wheel_of_fortune', '1', 'VIP0：转盘：倍数', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_1', 'wheel_of_fortune', '2', 'VIP1：转盘：倍数', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_2', 'wheel_of_fortune', '3', 'VIP2：转盘：倍数', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_3', 'wheel_of_fortune', '4', 'VIP3：转盘：倍数', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_4', 'wheel_of_fortune', '5', 'VIP4：转盘：倍数', null, null, '1');
INSERT INTO `s_cfg` VALUES ('vip_5', 'wheel_of_fortune', '6', 'VIP5：转盘：倍数', null, null, '1');

-- ----------------------------
-- Table structure for `s_manager`
-- ----------------------------
DROP TABLE IF EXISTS `s_manager`;
CREATE TABLE `s_manager` (
  `id` varchar(32) NOT NULL,
  `user_name` varchar(32) DEFAULT NULL,
  `user_pass` varchar(32) DEFAULT NULL,
  `status` int(2) DEFAULT NULL,
  `sex` int(2) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `mobile` varchar(32) DEFAULT NULL,
  `qq` varchar(32) DEFAULT NULL,
  `weixin` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of s_manager
-- ----------------------------
INSERT INTO `s_manager` VALUES ('1', 'admin', 'c4ca4238a0b923820dcc509a6f75849b', '1', null, '2017-07-25 11:40:57', null, null, null, null);
INSERT INTO `s_manager` VALUES ('9c012a33aa8b4ecc8aaf20ea149a6f25', 'mega', 'e10adc3949ba59abbe56e057f20f883e', '1', null, '2017-07-25 11:41:00', null, null, null, null);

-- ----------------------------
-- Table structure for `s_user`
-- ----------------------------
DROP TABLE IF EXISTS `s_user`;
CREATE TABLE `s_user` (
  `id` varchar(32) NOT NULL,
  `user_name` varchar(32) DEFAULT NULL,
  `user_pass` varchar(32) DEFAULT NULL,
  `status` int(2) DEFAULT NULL,
  `nickname` varchar(32) DEFAULT NULL,
  `sex` int(2) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `mobile` varchar(32) DEFAULT NULL,
  `qq` varchar(32) DEFAULT NULL,
  `weixin` varchar(128) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `current_score` int(11) DEFAULT NULL,
  `tool_1` int(11) DEFAULT NULL,
  `tool_2` int(11) DEFAULT NULL,
  `tool_3` int(11) DEFAULT NULL,
  `tool_4` int(11) DEFAULT NULL,
  `tool_5` int(11) DEFAULT NULL,
  `tool_6` int(11) DEFAULT NULL,
  `tool_7` int(11) DEFAULT NULL,
  `tool_8` int(11) DEFAULT NULL,
  `tool_9` int(11) DEFAULT NULL,
  `vip` int(2) DEFAULT NULL,
  `consume_count` int(11) DEFAULT NULL,
  `win_count` int(11) DEFAULT NULL,
  `lose_count` int(11) DEFAULT NULL,
  `win_score_count` int(11) DEFAULT NULL,
  `lose_score_count` int(11) DEFAULT NULL,
  `line_gone_count` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of s_user
-- ----------------------------
INSERT INTO `s_user` VALUES ('0525822071ab11e7a481015d0a4c1d9e', '吴老肥', '96e79218965eb72c92a549dd5a330112', '1', '吴老肥', '1', '2017-07-26 10:35:00', '', '', '', '', '20066', '0', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('1', 'hx', 'e10adc3949ba59abbe56e057f20f883e', '1', '张三', null, null, null, '1234', null, null, '999755674', '1213', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('2', 'wupeng  ', 'e10adc3949ba59abbe56e057f20f883e', '1', '李四', null, null, null, null, null, null, '998832792', '31231', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('2c730630708011e78e22ffc0f87ffa5a', '猫1', '96e79218965eb72c92a549dd5a330112', '1', '', '1', '2017-07-24 22:55:46', '', '', '', '', '30000', '0', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('3', 'lixiang', 'e10adc3949ba59abbe56e057f20f883e', '1', '王五', null, null, null, null, null, null, '999989930', '123123', '0', '0', '0', '0', '0', '0', '0', '0', '1', null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('4', 'wy', 'e10adc3949ba59abbe56e057f20f883e', '1', '哈哈', null, null, null, null, null, null, '901228843', '1233123', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('5', 't1', 'e10adc3949ba59abbe56e057f20f883e', '1', 't1', null, null, null, null, null, null, '19394', '123', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('6', 't2', 'e10adc3949ba59abbe56e057f20f883e', '1', 't2', null, null, null, null, null, null, '41600', '89', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('7', 't3', 'e10adc3949ba59abbe56e057f20f883e', '1', 't3', null, null, null, null, null, null, '122862147', '87', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('9c012a33aa8b4ecc8aaf20ea149a6f25', 'mega', 'e10adc3949ba59abbe56e057f20f883e', '1', '马六', null, '2017-08-08 10:18:43', null, '12341', null, null, '34720042', '123123', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('9fe2a410777c11e7bdc4fd3c0cd2bc87', '猫4', '96e79218965eb72c92a549dd5a330112', '0', '猫4123123', '1', '2017-08-02 20:18:00', '', '', '', '', '10065', '0', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('b5780670775f11e7831c0d095411373b', '猫2', '96e79218965eb72c92a549dd5a330112', '1', '猫2', '1', '2017-08-02 16:51:01', '', '', '', '', '43280', '0', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('c2fe9bb076ba11e7ad1a29fa785dd421', '雪箭轩', 'bde0814411dcea94c5e0d9b29e635510', '1', '雪箭轩', '1', '2017-08-01 21:10:17', '', '', '', '', '9570499', '0', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);
INSERT INTO `s_user` VALUES ('e5e252b0776011e7831c0d095411373b', '猫3', 'e10adc3949ba59abbe56e057f20f883e', '1', '猫34', '1', '2017-08-02 16:59:32', '', '', '', '', '1800023', '0', '0', '0', '0', '0', '0', '0', '0', '0', null, null, null, null, null, null, null);

-- ----------------------------
-- Table structure for `w_game_prop`
-- ----------------------------
DROP TABLE IF EXISTS `w_game_prop`;
CREATE TABLE `w_game_prop` (
  `id` varchar(32) NOT NULL DEFAULT '',
  `prop_name` varchar(32) DEFAULT NULL,
  `prop_desc` varchar(4000) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_game_prop
-- ----------------------------
INSERT INTO `w_game_prop` VALUES ('1', '冰冻', null, '2017-07-11 17:49:43');
INSERT INTO `w_game_prop` VALUES ('2', '锁定', null, '2017-06-06 10:29:31');
INSERT INTO `w_game_prop` VALUES ('3', '金币', '以个为单位', '2017-08-07 20:28:35');

-- ----------------------------
-- Table structure for `w_gift`
-- ----------------------------
DROP TABLE IF EXISTS `w_gift`;
CREATE TABLE `w_gift` (
  `id` varchar(32) NOT NULL,
  `user_id` varchar(32) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `receive_time` datetime DEFAULT NULL COMMENT '领取时间',
  `goods_id` int(11) DEFAULT NULL COMMENT '商品id',
  `gift_type` int(11) DEFAULT NULL,
  `game_prop_id` varchar(32) DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `user_vip` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_gift
-- ----------------------------
INSERT INTO `w_gift` VALUES ('5ff876807a8411e7bed62189316c9a34', '9c012a33aa8b4ecc8aaf20ea149a6f25', '2017-08-06 16:51:02', null, '3', '1', '2', '1', '2');
INSERT INTO `w_gift` VALUES ('60b526e07a7011e7a2ac09d69666beda', '9c012a33aa8b4ecc8aaf20ea149a6f25', '2017-08-06 14:27:54', null, '2', '1', '3', '2123123', '2');

-- ----------------------------
-- Table structure for `w_gift_type`
-- ----------------------------
DROP TABLE IF EXISTS `w_gift_type`;
CREATE TABLE `w_gift_type` (
  `id` varchar(32) NOT NULL,
  `type_name` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_gift_type
-- ----------------------------
INSERT INTO `w_gift_type` VALUES ('1', '每日登陆');
INSERT INTO `w_gift_type` VALUES ('2', '退出');

-- ----------------------------
-- Table structure for `w_goods`
-- ----------------------------
DROP TABLE IF EXISTS `w_goods`;
CREATE TABLE `w_goods` (
  `id` varchar(32) NOT NULL DEFAULT '',
  `goods_name` varchar(32) DEFAULT NULL,
  `goods_desc` varchar(4000) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `cost` int(11) DEFAULT NULL COMMENT '人民币',
  `payment_id` varchar(128) DEFAULT NULL COMMENT '支付平台的商品id',
  `disposable` int(1) DEFAULT NULL COMMENT '一次性的',
  `interval_time` int(2) DEFAULT NULL COMMENT '购买的间隔时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_goods
-- ----------------------------
INSERT INTO `w_goods` VALUES ('0618ba207bcf11e784627dd159406629', '商品7', '商品7', '2017-08-08 08:17:55', '7', '7', '1', '7');
INSERT INTO `w_goods` VALUES ('1', '商品3', '商品3', '2017-07-11 17:49:43', '3', '3', '1', '3');
INSERT INTO `w_goods` VALUES ('170f87f07bcf11e784627dd159406629', '商品8', '商品8', '2017-08-08 08:18:23', '8', '8', '1', '8');
INSERT INTO `w_goods` VALUES ('2', '商品1', '商品1', '2017-06-06 10:29:31', '1', '1', '1', '1');
INSERT INTO `w_goods` VALUES ('3', '商品2', '商品2', '2017-07-11 17:47:41', '2', '2', '0', '2');
INSERT INTO `w_goods` VALUES ('4', '商品4', '商品4', '2017-08-01 21:39:34', '4', '4', '0', '4');
INSERT INTO `w_goods` VALUES ('5020b6507bce11e784627dd159406629', '商品5', '商品5', '2017-08-08 08:12:50', '5', '5', '1', '5');
INSERT INTO `w_goods` VALUES ('587a29d07bce11e784627dd159406629', '商品6', '商品6', '2017-08-08 08:13:04', '6', '6', '1', '6');
INSERT INTO `w_goods` VALUES ('baa2bff07bd811e78b655f61f9095a9f', '登陆奖励', '登陆奖励', '2017-08-08 09:27:23', '0', '', '0', '24');

-- ----------------------------
-- Table structure for `w_goods_detail`
-- ----------------------------
DROP TABLE IF EXISTS `w_goods_detail`;
CREATE TABLE `w_goods_detail` (
  `id` varchar(32) NOT NULL DEFAULT '',
  `goods_id` varchar(32) DEFAULT NULL,
  `game_prop_id` varchar(32) DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_goods_detail
-- ----------------------------
INSERT INTO `w_goods_detail` VALUES ('1', '1', '1', '1', '2017-08-07 17:16:58');
INSERT INTO `w_goods_detail` VALUES ('10', '0618ba207bcf11e784627dd159406629', '3', '77', '2017-08-08 08:18:07');
INSERT INTO `w_goods_detail` VALUES ('11', '170f87f07bcf11e784627dd159406629', '3', '88', '2017-08-08 08:18:45');
INSERT INTO `w_goods_detail` VALUES ('12', 'baa2bff07bd811e78b655f61f9095a9f', '3', '10000', '2017-08-08 09:27:55');
INSERT INTO `w_goods_detail` VALUES ('13', 'baa2bff07bd811e78b655f61f9095a9f', '2', '3', '2017-08-08 09:28:18');
INSERT INTO `w_goods_detail` VALUES ('2', '1', '2', '2', '2017-08-07 17:17:01');
INSERT INTO `w_goods_detail` VALUES ('3', '2', '1', '3', '2017-08-07 17:17:03');
INSERT INTO `w_goods_detail` VALUES ('4', '2', '2', '4', '2017-08-07 17:17:06');
INSERT INTO `w_goods_detail` VALUES ('5', '1', '3', '5', '2017-08-07 20:30:30');
INSERT INTO `w_goods_detail` VALUES ('6', '3', '3', '33', '2017-08-08 08:15:57');
INSERT INTO `w_goods_detail` VALUES ('7', '4', '3', '44', '2017-08-08 08:16:34');
INSERT INTO `w_goods_detail` VALUES ('8', '5020b6507bce11e784627dd159406629', '3', '55', '2017-08-08 08:17:13');
INSERT INTO `w_goods_detail` VALUES ('9', '587a29d07bce11e784627dd159406629', '3', '66', '2017-08-08 08:17:31');

-- ----------------------------
-- Table structure for `w_notice`
-- ----------------------------
DROP TABLE IF EXISTS `w_notice`;
CREATE TABLE `w_notice` (
  `id` varchar(32) NOT NULL DEFAULT '',
  `title` varchar(32) DEFAULT NULL,
  `content` varchar(4000) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `user_id` varchar(32) DEFAULT NULL,
  `last_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_notice
-- ----------------------------
INSERT INTO `w_notice` VALUES ('bullet_level_consume', '10', '子弹消耗倍数', '2017-07-11 17:49:43', '1', '2017-07-27 20:03:45');
INSERT INTO `w_notice` VALUES ('bullet_level_max', '100', '子弹最大等级', '2017-06-06 10:29:31', '1', null);
INSERT INTO `w_notice` VALUES ('bullet_level_min', '1', '子弹最小等级', '2017-07-11 17:47:41', '1', null);
INSERT INTO `w_notice` VALUES ('da426e6076be11e7ad1a29fa785dd421', '111', '杨光在游戏<b><font color=\"#fbe983\">中已充值99</font></b>99<strike><font color=\"#f83a22\">999</font></strike>', '2017-08-01 21:39:34', '1', null);

-- ----------------------------
-- Table structure for `w_order`
-- ----------------------------
DROP TABLE IF EXISTS `w_order`;
CREATE TABLE `w_order` (
  `id` varchar(32) NOT NULL,
  `user_id` varchar(32) DEFAULT NULL,
  `goods_id` varchar(32) DEFAULT NULL,
  `create_time` datetime DEFAULT NULL,
  `order_id` varchar(64) DEFAULT NULL,
  `status` int(11) DEFAULT NULL COMMENT '0未领取 1领取',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of w_order
-- ----------------------------
INSERT INTO `w_order` VALUES ('03f24fa07a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:36:53', 'PB15552017080611424675675', '1');
INSERT INTO `w_order` VALUES ('0c3b96807a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:07', 'PB15552017080611424675675', '1');
INSERT INTO `w_order` VALUES ('151843c07a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:22', 'PB15552017080611424675675', '1');
INSERT INTO `w_order` VALUES ('1b163b107a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:32', 'PB15552017080611424675675', '1');
INSERT INTO `w_order` VALUES ('1bc8e9407a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:33', 'PB15552017080611424675675', '1');
INSERT INTO `w_order` VALUES ('1d18c1d07a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:35', 'PB15552017080611424675675', '0');
INSERT INTO `w_order` VALUES ('1e6258d07a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:37', 'PB15552017080611424675675', '0');
INSERT INTO `w_order` VALUES ('1efc00c07a7a11e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:37:38', 'PB15552017080611424675675', '0');
INSERT INTO `w_order` VALUES ('9fd3f8707a7911e7ae301facf754df8a', '9c012a33aa8b4ecc8aaf20ea149a6f25', '1', '2017-08-06 15:34:05', 'PB15552017080611424675675', '1');
