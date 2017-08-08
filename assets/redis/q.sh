#!/bin/bash

echo "authorize.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/authorize.lua)"

echo ""
echo "token.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/token.lua)"

echo ""
echo "my_info.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/my_info.lua)"

echo ""
echo "user_info.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/user_info.lua)"

echo ""
echo "user_info_money.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/user_info_money.lua)"

echo ""
echo "user_info_vip.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/user_info_vip.lua)"

echo ""
echo "channel_close.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/channel_close.lua)"

# 

echo ""
echo "back_open.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/back_open.lua)"

echo ""
echo "back_close.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/back_close.lua)"

echo ""
echo "back_list.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/back_list.lua)"

# 

echo ""
echo "front_open.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/front_open.lua)"

echo ""
echo "front_close.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/front_close.lua)"

echo ""
echo "front_list.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/front_list.lua)"

# 

echo ""
echo "group_search.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/group_search.lua)"

echo ""
echo "group_quit"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/group_quit.lua)"

echo ""
echo "group_users.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/group_users.lua)"

echo ""
echo "group_users_channel.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/group_users_channel.lua)"

echo ""
echo "group_users_ready.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/group_users_ready.lua)"

# 

echo ""
echo "fishjoy_ready.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/fishjoy_ready.lua)"

echo ""
echo "fishjoy_shot.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/fishjoy_shot.lua)"

echo ""
echo "fishjoy_blast.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/fishjoy_blast.lua)"

echo ""
echo "fishjoy_bullet.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/fishjoy_bullet.lua)"

echo ""
echo "fishjoy_switch.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/fishjoy_switch.lua)"

echo ""
echo "fishjoy_tool.lua"
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 script load "$(cat /root/my/git/speedt/g2/assets/redis/fishjoy_tool.lua)"

echo ""
/root/my/redis/redis-3.2.6/src/redis-cli -a 123456 -p 12379 --eval /root/my/git/speedt/g2/assets/redis/init.lua 1 ,
